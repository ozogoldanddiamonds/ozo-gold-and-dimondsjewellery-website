import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AddressService } from '../service/address.service';
import { OrdersService } from '../service/orders.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../service/cart.service';
import { firstValueFrom } from 'rxjs';
declare global {
  interface Window {
    Razorpay: any;
  }
}

@Component({
  selector: 'app-cart-checkout',
  templateUrl: './cart-checkout.component.html',
  styleUrls: ['./cart-checkout.component.css']
})
export class CartCheckoutComponent implements OnInit, OnDestroy {
  showDeleteAddressModal = false;
  addressToDelete: any = null;
  addressForm!: FormGroup;

  showAddressModal = false;
  isSavingAddress = false;
  addressFormError = '';
  isEditAddressMode = false;
  editingAddressId: string | null = null;

  settingDefaultAddressId: string | null = null;
  deletingAddressId: string | null = null;

  cartItems: any[] = [];
  cartId: string | null = null;
  cartTotal = 0;
  isLoadingCart = false;
  addressList: any[] = [];
  selectedAddress: any = null;
  addressLoading = false;
  addressError = '';

  paymentMethod = 'razorpay';
  isProcessingPayment = false;
  isVerifyingPayment = false;


  addresses: any[] = [];

  isAddressModalOpen: boolean = false;
  modalMode: 'add' | 'manage' = 'add';
  manageView: 'list' | 'add' = 'list';
  editingAddress: any = null;

  userId: string = localStorage.getItem('userId') || '';
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private addressService: AddressService,
    private orderService: OrdersService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private cartService: CartService,
  ) { }

  ngOnInit(): void {


    this.initForm();
    this.getAddresses();
    this.loadCart();
  }
  initForm() {
    this.addressForm = this.fb.group({
      user: [this.userId],
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      country: ['India', Validators.required],
      isDefault: [false]
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCart(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoadingCart = true;

    this.cartService.getCart(userId).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.toaster.error('Unable to load cart');
          return;
        }

        this.cartId = res.cartId;
        this.cartItems = res.items || [];
        this.cartTotal = Number(res.cartTotal || 0);

        if (this.cartItems.length === 0) {
          this.toaster.warning('Your cart is empty');
          this.router.navigate(['/cart']);
          return;
        }

        // Default address and other checkout initialization
        // should continue separately.
      },
      error: (err: any) => {
        console.error('Get cart error:', err);
        this.toaster.error('Unable to load cart');
      },
      complete: () => {
        this.isLoadingCart = false;
      }
    });
  }

  getItemCount(): number {
    return this.cartItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0
    );
  }

  getItemTotal(item: any): number {
    const unitPrice = Number(
      item?.selectedVariant?.finalPrice ??
      item?.selectedVariant?.priceBreakup?.finalPrice ??
      0
    );

    const quantity = Number(item?.quantity) || 0;

    return Math.round((unitPrice * quantity + Number.EPSILON) * 100) / 100;
  }

  getSubtotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + this.getItemTotal(item),
      0
    );
  }

  // selectAddress(address: any): void {
  //   this.selectedAddress = address;
  //   this.addressError = '';
  // }

  getAddresses(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.addressList = [];
      this.selectedAddress = null;
      return;
    }

    this.addressLoading = true;

    this.subscriptions.add(
      this.addressService.getAddresses(userId).subscribe({
        next: (res: any) => {
          this.addressList = res?.data || res?.addresses || [];

          this.selectedAddress =
            this.addressList.find((address: any) => address.isDefault) ||
            this.addressList[0] ||
            null;

          this.addressLoading = false;
        },
        error: (error: any) => {
          console.error('Address loading failed:', error);
          this.addressList = [];
          this.selectedAddress = null;
          this.addressLoading = false;
          this.addressError = 'Unable to load addresses. Please try again.';
        }
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }


  async continueCheckout(): Promise<void> {
    if (this.isProcessingPayment) {
      return;
    }

    if (!localStorage.getItem('userId')) {
      this.toaster.warning('Please login first');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.cartItems.length) {
      this.toaster.warning('Your cart is empty');
      return;
    }

    if (this.addressLoading) {
      this.toaster.info('Please wait while addresses are loading');
      return;
    }

    if (!this.selectedAddress?._id) {
      this.addressError = 'Please select a delivery address';
      this.toaster.warning(this.addressError);
      return;
    }

    if (this.hasOutOfStockItems()) {
      this.toaster.error('Please check stock availability');
      return;
    }

    // Online payment is the only supported payment method.
    this.paymentMethod = 'razorpay';

    await this.openRazorpayCheckout();
  }


  private hasOutOfStockItems(): boolean {
    return this.cartItems.some((item: any) => {
      const stock = Number(item?.stock ?? item?.selectedVariant?.stock) || 0;
      const quantity = Number(item?.quantity) || 0;

      return stock <= 0 || quantity > stock;
    });
  }

  private buildPaymentItems(): any[] | null {
    const result: any[] = [];

    for (const item of this.cartItems) {
      const productId = item.productId || item.product?._id;
      const variant = item.selectedVariant || item.variant;
      const variantId = variant?._id || item.variantId;
      const quantity = Number(item.quantity);

      if (
        !productId ||
        !variantId ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return null;
      }

      result.push({
        productId,
        variantId: String(variantId),
        quantity
      });
    }

    return result.length ? result : null;
  }

  private loadRazorpayScript(): Promise<void> {
    if (window.Razorpay) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      ) as HTMLScriptElement | null;

      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('Unable to load Razorpay checkout')),
          { once: true }
        );
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Unable to load Razorpay checkout'));

      document.body.appendChild(script);
    });
  }

  async openRazorpayCheckout(): Promise<void> {
    const items = this.buildPaymentItems();

    if (!items) {
      this.toaster.error(
        'Some cart items are missing product, variant or quantity details'
      );
      return;
    }

    this.isProcessingPayment = true;

    try {
      await this.loadRazorpayScript();

      const response: any = await new Promise((resolve, reject) => {
        const sub = this.orderService.createRazorpayOrder({
          items,
          addressId: this.selectedAddress._id
        }).subscribe({
          next: resolve,
          error: reject
        });

        this.subscriptions.add(sub);
      });

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message || 'Unable to create payment order'
        );
      }

      const payment = response.data;

      const options = {
        key: payment.keyId,
        amount: String(payment.amount),
        currency: payment.currency || 'INR',
        name: 'OZO Gold & Diamonds',
        description: `Cart checkout - ${this.cartItems.length} item(s)`,
        order_id: payment.razorpayOrderId,
        prefill: {
          name: this.selectedAddress.fullName || '',
          contact: this.selectedAddress.phone || ''
        },
        theme: {
          color: '#B8860B'
        },
        modal: {
          ondismiss: () => {
            this.isProcessingPayment = false;
          }
        },
        handler: (result: any) => {
          void this.verifyPayment(result, payment);
        }
      };

      const checkout = new window.Razorpay(options);

      checkout.on('payment.failed', (result: any) => {
        console.error('Razorpay payment failed:', result?.error);
        this.isProcessingPayment = false;

        this.toaster.error(
          result?.error?.description || 'Payment could not be completed'
        );
      });

      checkout.open();
    } catch (error: any) {
      console.error('Checkout initialization failed:', error);
      this.isProcessingPayment = false;

      this.toaster.error(
        error?.error?.message ||
        error?.message ||
        'Unable to start checkout'
      );
    }
  }


  private async verifyPayment(
    result: any,
    payment: any
  ): Promise<void> {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = result || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      this.isProcessingPayment = false;
      this.isVerifyingPayment = false;

      // Incomplete response does not prove payment failure.
      await this.router.navigate(['/payment-pending'], {
        replaceUrl: true,
        state: {
          paymentState: 'pending',
          paymentAttemptId: payment?.paymentAttemptId,
          paymentId: razorpay_payment_id || null,
          amount: Number(payment?.amount || 0) / 100,
          message:
            'Payment response is incomplete. Please check your payment status before retrying.'
        }
      });

      return;
    }

    this.isVerifyingPayment = true;

    const verifySub = this.orderService.verifyRazorpayPayment({
      paymentAttemptId: payment.paymentAttemptId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    }).subscribe({

      next: async (verification: any) => {

        const data = verification?.data;

        this.isVerifyingPayment = false;
        this.isProcessingPayment = false;

        // 1. Payment verified and order created successfully
        if (
          verification?.success &&
          data?.status === 'ORDER_CREATED' &&
          data?.orderId
        ) {

          const cartCleared =
            await this.clearCartAfterSuccessfulOrder();

          if (!cartCleared) {
            console.error(
              'Order created successfully, but cart items could not be removed.'
            );
          }

          await this.router.navigate(['/payment-success'], {
            replaceUrl: true,
            state: {
              paymentState: 'success',
              status: data.status,
              paymentAttemptId: payment.paymentAttemptId,
              paymentId: razorpay_payment_id,
              orderId: data.orderId,
              amount: Number(payment.amount) / 100
            }
          });

          return;
        }

        // 2. Explicit failure only when backend confirms it
        if (
          data?.status === 'FAILED' ||
          data?.status === 'PAYMENT_FAILED'
        ) {

          await this.router.navigate(['/payment-failure'], {
            replaceUrl: true,
            state: {
              paymentState: 'failure',
              paymentAttemptId: payment.paymentAttemptId,
              paymentId: razorpay_payment_id,
              razorpayOrderId: razorpay_order_id,
              amount: Number(payment.amount) / 100,
              message:
                data?.message || 'Payment could not be completed.'
            }
          });

          return;
        }

        // 3. Any other status is treated as pending
        await this.router.navigate(['/payment-pending'], {
          replaceUrl: true,
          state: {
            paymentState: 'pending',
            status: data?.status || 'PENDING',
            paymentAttemptId: payment.paymentAttemptId,
            paymentId: razorpay_payment_id,
            orderId: data?.orderId || null,
            amount: Number(payment.amount) / 100,
            message:
              'Payment is being confirmed. Please check your orders before trying again.'
          }
        });

      },

      // 4. Verification API error does not mean payment failed
      error: async (error: any) => {

        console.error('Payment verification failed:', error);

        this.isVerifyingPayment = false;
        this.isProcessingPayment = false;

        await this.router.navigate(['/payment-pending'], {
          replaceUrl: true,
          state: {
            paymentState: 'pending',
            paymentAttemptId: payment.paymentAttemptId,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amount: Number(payment.amount) / 100,
            message:
              'Payment status is being confirmed. Please check your orders before trying again.'
          }
        });

      }

    });

    this.subscriptions.add(verifySub);
  }



  // openAddAddress() {
  //   this.modalMode = 'add';
  //   this.manageView = 'add';
  //   this.editingAddress = null;
  //   this.isAddressModalOpen = true;

  //   this.addressForm.reset({
  //     user: this.userId,
  //     country: 'India',
  //     isDefault: false
  //   });
  // }

  openManageAddress(addr: any, event: Event) {
    event.stopPropagation();
    this.modalMode = 'manage';
    this.manageView = 'list';
    this.editingAddress = addr;
    this.isAddressModalOpen = true;
  }

  switchToAddMode() {
    this.modalMode = 'add';
    this.manageView = 'add';
    this.editingAddress = null;
    this.addressForm.reset({
      user: this.userId,
      country: 'India',
      isDefault: false
    });
  }

  closeAddressModal() {
    this.isAddressModalOpen = false;
    this.editingAddress = null;
    this.manageView = 'list';
  }

  selectAddress(addr: any) {
    this.selectedAddress = addr;
  }





  editAddress(address: any): void {
    this.addressFormError = '';
    this.isEditAddressMode = true;
    this.editingAddressId = address._id;
    this.showAddressModal = true;

    this.addressService.getAddressById(address._id).subscribe({
      next: (response: any) => {
        if (!response?.success || !response?.data) {
          this.addressFormError = response?.message || 'Address not found.';
          return;
        }

        const data = response.data;

        this.addressForm.patchValue({
          fullName: data.fullName || '',
          phone: data.phone || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          landmark: data.landmark || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || data.postalCode || '',
          country: data.country || 'India',
          isDefault: !!data.isDefault
        });
      },
      error: (error: any) => {
        console.error('Get address by ID failed:', error);
        this.addressFormError =
          error?.error?.message || 'Unable to load address details.';
      }
    });
  }




  openAddAddress(): void {
    this.isEditAddressMode = false;
    this.editingAddressId = null;
    this.addressFormError = '';

    this.addressForm.reset({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: this.addressList.length === 0
    });

    this.showAddressModal = true;
  }


  closeAddAddress(): void {
    if (this.isSavingAddress) {
      return;
    }

    this.showAddressModal = false;
    this.addressFormError = '';
  }


  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.toaster.warning('Please login to manage your address.');
      this.router.navigate(['/login']);
      return;
    }

    this.isSavingAddress = true;
    this.addressFormError = '';

    const formValue = this.addressForm.getRawValue();

    const payload = {
      user: userId,
      fullName: formValue.fullName.trim(),
      phone: formValue.phone.trim(),
      addressLine1: formValue.addressLine1.trim(),
      addressLine2: formValue.addressLine2?.trim() || '',
      landmark: formValue.landmark?.trim() || '',
      city: formValue.city.trim(),
      state: formValue.state.trim(),
      pincode: formValue.pincode.trim(),
      country: formValue.country.trim(),
      isDefault: Boolean(formValue.isDefault) || this.addressList.length === 0
    };

    const request$ = this.isEditAddressMode && this.editingAddressId
      ? this.addressService.updateAddress(this.editingAddressId, payload)
      : this.addressService.createAddress(payload);

    request$.subscribe({
      next: (response: any) => {
        if (!response?.success || !response?.data?._id) {
          this.isSavingAddress = false;
          this.addressFormError =
            response?.message || 'Unable to save address.';
          return;
        }

        const savedAddress = response.data;

        // If selected as default, update all addresses through the default API.
        if (payload.isDefault && !savedAddress.isDefault) {
          this.addressService.setDefaultAddress(savedAddress._id).subscribe({
            next: () => {
              savedAddress.isDefault = true;
              this.finishAddressSave(savedAddress);
            },
            error: (error: any) => {
              console.error('Set default address failed:', error);
              this.finishAddressSave(savedAddress);
              this.toaster.warning(
                'Address saved, but setting it as default failed.'
              );
            }
          });
        } else {
          this.finishAddressSave(savedAddress);
        }
      },
      error: (error: any) => {
        console.error('Save/update address failed:', error);
        this.isSavingAddress = false;
        this.addressFormError =
          error?.error?.message || 'Failed to save address. Please try again.';
      }
    });
  }


  private finishAddressSave(address: any): void {

    const wasEdit = this.isEditAddressMode;

    this.addressList = [
      address,
      ...this.addressList.filter(
        (item: any) => item._id !== address._id
      )
    ];

    if (address.isDefault) {
      this.addressList = this.addressList.map((item: any) => ({
        ...item,
        isDefault: item._id === address._id
      }));
    }

    this.selectedAddress = address;

    this.showAddressModal = false;
    this.isSavingAddress = false;
    this.isEditAddressMode = false;
    this.editingAddressId = null;
    this.addressFormError = '';

    this.toaster.success(
      wasEdit
        ? 'Address updated successfully.'
        : 'Address saved successfully.'
    );
  }

  /**
   * Update the localStorage keys here if your login flow stores
   * the logged-in user's ID under a different key/structure.
   */
  private getLoggedInUserId(): string | null {
    const directUserId =
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id');

    if (directUserId) {
      return directUserId;
    }

    const possibleKeys = ['currentUser', 'user', 'loginUser'];

    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      try {
        const parsed = JSON.parse(raw);
        const id =
          parsed?._id ||
          parsed?.id ||
          parsed?.user?._id ||
          parsed?.user?.id;

        if (id) {
          return id;
        }
      } catch {
        // The value may be a plain ID rather than JSON.
        if (raw.length > 10) {
          return raw;
        }
      }
    }

    return null;
  }



  setDefaultAddress(address: any): void {
    if (!address?._id || address.isDefault || this.settingDefaultAddressId) {
      return;
    }

    this.settingDefaultAddressId = address._id;

    this.addressService.setDefaultAddress(address._id).subscribe({
      next: (response: any) => {
        if (!response?.success) {
          this.toaster.error(
            response?.message || 'Unable to update default address.'
          );
          return;
        }

        this.addressList = this.addressList.map((item: any) => ({
          ...item,
          isDefault: item._id === address._id
        }));

        const updatedAddress = this.addressList.find(
          (item: any) => item._id === address._id
        );

        if (updatedAddress && this.selectedAddress?._id === address._id) {
          this.selectedAddress = updatedAddress;
        } else if (updatedAddress && this.selectedAddress) {
          this.selectedAddress = {
            ...this.selectedAddress,
            isDefault: false
          };
        }

        this.toaster.success('Default address updated successfully.');
      },
      error: (error: any) => {
        console.error('Set default address failed:', error);
        this.toaster.error(
          error?.error?.message || 'Failed to update default address.'
        );
      },
      complete: () => {
        this.settingDefaultAddressId = null;
      }
    });
  }



  // Open delete confirmation popup
  deleteAddress(address: any): void {

    if (!address?._id || this.deletingAddressId) {
      return;
    }

    this.addressToDelete = address;
    this.showDeleteAddressModal = true;
  }


  // Close confirmation popup
  closeDeleteAddressModal(): void {

    if (this.deletingAddressId) {
      return;
    }

    this.showDeleteAddressModal = false;
    this.addressToDelete = null;
  }


  // Confirm and delete address
  confirmDeleteAddress(): void {

    const address = this.addressToDelete;

    if (!address?._id || this.deletingAddressId) {
      return;
    }

    this.deletingAddressId = address._id;

    this.addressService.deleteAddress(address._id).subscribe({

      next: (response: any) => {

        if (!response?.success) {
          this.toaster.error(
            response?.message || 'Unable to delete address'
          );
          return;
        }

        const wasSelected =
          this.selectedAddress?._id === address._id;

        const wasDefault = address.isDefault;

        // Remove deleted address
        this.addressList = this.addressList.filter(
          (item: any) => item._id !== address._id
        );

        if (wasSelected) {
          this.selectedAddress = this.addressList[0] || null;
        }

        this.showDeleteAddressModal = false;
        this.addressToDelete = null;

        // If deleted address was default, assign another default
        if (wasDefault && this.addressList.length > 0) {

          const nextDefault = this.addressList[0];

          this.addressService.setDefaultAddress(nextDefault._id)
            .subscribe({

              next: (defaultResponse: any) => {

                if (!defaultResponse?.success) {
                  this.toaster.warning(
                    'Address deleted. Please set another default address.'
                  );
                  return;
                }

                this.addressList = this.addressList.map(
                  (item: any) => ({
                    ...item,
                    isDefault: item._id === nextDefault._id
                  })
                );

                if (this.selectedAddress?._id === nextDefault._id) {
                  this.selectedAddress = {
                    ...this.selectedAddress,
                    isDefault: true
                  };
                }

                this.toaster.success(
                  'Address deleted and default address updated.'
                );
              },

              error: (err: any) => {

                console.error('Set default address error:', err);

                this.toaster.warning(
                  'Address deleted. Please set another default address.'
                );
              }

            });

        } else {

          this.toaster.success('Address deleted successfully.');

        }

      },

      error: (err: any) => {

        console.error('Delete address error:', err);

        this.toaster.error(
          err?.error?.message || 'Failed to delete address'
        );

      },

      complete: () => {
        this.deletingAddressId = null;
      }

    });
  }
  private async clearCartAfterSuccessfulOrder(): Promise<boolean> {
    if (!this.cartId || !this.cartItems?.length) {
      console.warn('Cart ID or cart items are missing');
      return false;
    }

    try {
      // Delete each purchased cart item using cartItemId
      for (const item of this.cartItems) {
        const cartItemId = item?.cartItemId;

        if (!cartItemId) {
          console.warn('Cart item ID missing:', item);
          continue;
        }

        await firstValueFrom(
          this.cartService.removeCartItem(
            this.cartId,
            cartItemId
          )
        );
      }

      // Clear local cart data after successful deletion
      this.cartItems = [];
      this.cartId = '';

      // Refresh cart count in header/navbar
      this.cartService.loadCartCount();

      return true;

    } catch (error) {
      console.error('Cart clearing failed:', error);
      return false;
    }
  }

}
