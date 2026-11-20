import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AddressService } from '../service/address.service';
import { OrdersService } from '../service/orders.service';
import { SERVICEABLE_PINCODES } from '../sequel-service-pincodes/serviceable-pincodes';
declare global {
  interface Window {
    Razorpay: any;
  }
}

@Component({
  selector: 'app-buynow-checkout',
  templateUrl: './buynow-checkout.component.html',
  styleUrls: ['./buynow-checkout.component.css']
})
export class BuynowCheckoutComponent implements OnInit, OnDestroy {
  // PIN Code dropdown
  serviceablePincodes: string[] = SERVICEABLE_PINCODES;

  filteredPincodes: string[] = [...SERVICEABLE_PINCODES];

  pincodeSearch = '';

  showPincodeDropdown = false;

  // PIN Code verification
  isCheckingPincode = false;

  isPincodeVerified = false;

  pincodeVerificationError = '';
  showDeleteAddressModal = false;
  addressToDelete: any = null;
  product: any = null;
  selectedVariant: any = null;
  quantity = 1;

  addressForm!: FormGroup;

  addressList: any[] = [];
  selectedAddress: any = null;
  addressLoading = false;
  addressError = '';

  showAddressModal = false;
  isSavingAddress = false;
  addressFormError = '';
  isEditAddressMode = false;
  editingAddressId: string | null = null;

  settingDefaultAddressId: string | null = null;
  deletingAddressId: string | null = null;

  paymentMethod = 'razorpay';

  isProcessingPayment = false;
  isVerifyingPayment = false;

  userId = localStorage.getItem('userId') || '';

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private addressService: AddressService,
    private orderService: OrdersService,
    private toaster: ToastrService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadBuyNowProduct();
    this.getAddresses();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ----------------------------------
  // LOAD BUY NOW PRODUCT
  // ----------------------------------

  loadBuyNowProduct(): void {

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    const savedData = sessionStorage.getItem('buyNowCheckout');

    if (!savedData) {
      this.toaster.warning('No product selected for checkout');
      this.router.navigate(['/home']);
      return;
    }

    try {
      const data = JSON.parse(savedData);

      if (
        !data?.product?._id ||
        !data?.selectedVariant?._id ||
        !Number.isInteger(Number(data.quantity)) ||
        Number(data.quantity) < 1
      ) {
        throw new Error('Invalid checkout data');
      }

      this.product = data.product;
      this.selectedVariant = data.selectedVariant;
      this.quantity = Number(data.quantity);

      if (this.hasOutOfStock()) {
        this.toaster.warning('Selected quantity is not available');
      }

    } catch (error) {
      console.error('Buy now checkout data error:', error);
      sessionStorage.removeItem('buyNowCheckout');
      this.toaster.error('Unable to load selected product');
      this.router.navigate(['/home']);
    }
  }

  // ----------------------------------
  // PRICE AND STOCK
  // ----------------------------------

  getUnitPrice(): number {
    return Number(
      this.selectedVariant?.finalPrice ??
      this.selectedVariant?.priceBreakup?.finalPrice ??
      0
    );
  }

  getSubtotal(): number {
    return Math.round(
      (this.getUnitPrice() * this.quantity + Number.EPSILON) * 100
    ) / 100;
  }

  hasOutOfStock(): boolean {
    const stock = Number(this.selectedVariant?.stock || 0);

    return (
      !this.selectedVariant ||
      stock <= 0 ||
      this.quantity > stock
    );
  }

  // ----------------------------------
  // ADDRESS FORM
  // ----------------------------------

  initForm(): void {
    this.addressForm = this.fb.group({
      user: [this.userId],
      fullName: ['', Validators.required],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      landmark: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]],
      country: ['India', Validators.required],
      isDefault: [false]
    });
  }

  getAddresses(): void {

    if (!this.userId) {
      this.addressList = [];
      this.selectedAddress = null;
      return;
    }

    this.addressLoading = true;

    const sub = this.addressService.getAddresses(this.userId)
      .subscribe({
        next: (res: any) => {

          this.addressList = res?.data || res?.addresses || [];

          this.selectedAddress =
            this.addressList.find((a: any) => a.isDefault) ||
            this.addressList[0] ||
            null;

          this.addressLoading = false;
        },

        error: (err: any) => {
          console.error('Address loading failed:', err);

          this.addressList = [];
          this.selectedAddress = null;
          this.addressLoading = false;

          this.addressError = 'Unable to load addresses. Please try again.';
        }
      });

    this.subscriptions.add(sub);
  }

  selectAddress(address: any): void {
    this.selectedAddress = address;
    this.addressError = '';
  }



  // ----------------------------------
  // EDIT ADDRESS
  // ----------------------------------


  editAddress(address: any): void {

    this.addressFormError = '';

    this.isEditAddressMode = true;
    this.editingAddressId = address._id;
    this.showAddressModal = true;

    // Reset pincode verification
    this.pincodeSearch = '';
    this.filteredPincodes = [...this.serviceablePincodes];

    this.showPincodeDropdown = false;
    this.isPincodeVerified = false;
    this.isCheckingPincode = false;
    this.pincodeVerificationError = '';

    this.addressService.getAddressById(address._id).subscribe({

      next: (response: any) => {

        if (!response?.success || !response?.data) {
          this.addressFormError =
            response?.message || 'Address not found.';
          return;
        }

        const data = response.data;

        const pincode = String(
          data.pincode || data.postalCode || ''
        );

        this.addressForm.patchValue({

          fullName: data.fullName || '',
          phone: data.phone || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          landmark: data.landmark || '',
          city: data.city || '',
          state: data.state || '',
          pincode: pincode,
          country: data.country || 'India',
          isDefault: !!data.isDefault

        });

        // Populate dropdown input
        this.pincodeSearch = pincode;

        // Verify existing pincode using Sequel API
        if (/^\d{6}$/.test(pincode)) {
          this.verifyPincode(pincode);
        } else {
          this.pincodeVerificationError =
            'Please select a valid PIN Code.';
        }

      },

      error: (error: any) => {

        console.error('Get address by ID failed:', error);

        this.addressFormError =
          error?.error?.message ||
          'Unable to load address details.';

      }

    });

  }



  openAddAddress(): void {

    this.isEditAddressMode = false;
    this.editingAddressId = null;
    this.addressFormError = '';

    // Reset PIN Code dropdown
    this.pincodeSearch = '';

    this.filteredPincodes = [...this.serviceablePincodes];

    this.showPincodeDropdown = false;

    // Reset verification
    this.isPincodeVerified = false;
    this.isCheckingPincode = false;
    this.pincodeVerificationError = '';

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

    // Verification must be completed
    if (this.isCheckingPincode) {
      this.toaster.info(
        'Please wait for PIN Code verification.'
      );
      return;
    }

    const enteredPincode = String(
      this.addressForm.get('pincode')?.value || ''
    );

    // Ensure selected PIN matches verified PIN
    if (
      !this.isPincodeVerified ||
      enteredPincode !== this.pincodeSearch ||
      !/^\d{6}$/.test(enteredPincode)
    ) {
      this.toaster.warning(
        'Please verify a serviceable PIN Code first.'
      );
      return;
    }

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
      isDefault:
        Boolean(formValue.isDefault) ||
        this.addressList.length === 0
    };

    const request$ =
      this.isEditAddressMode && this.editingAddressId
        ? this.addressService.updateAddress(
          this.editingAddressId,
          payload
        )
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

        if (payload.isDefault && !savedAddress.isDefault) {

          this.addressService.setDefaultAddress(
            savedAddress._id
          ).subscribe({

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
          error?.error?.message ||
          'Failed to save address. Please try again.';

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
    this.showPincodeDropdown = false;
    this.pincodeSearch = '';

    this.isPincodeVerified = false;
    this.isCheckingPincode = false;
    this.pincodeVerificationError = '';
    this.toaster.success(
      wasEdit
        ? 'Address updated successfully.'
        : 'Address saved successfully.'
    );
  }

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

  // ----------------------------------
  // SET DEFAULT ADDRESS
  // ----------------------------------

  setDefaultAddress(address: any): void {

    if (!address?._id || address.isDefault || this.settingDefaultAddressId) {
      return;
    }

    this.settingDefaultAddressId = address._id;

    this.addressService.setDefaultAddress(address._id)
      .subscribe({
        next: (response: any) => {

          if (!response?.success) {
            this.toaster.error(
              response?.message || 'Unable to update default address'
            );
            return;
          }

          this.addressList = this.addressList.map(a => ({
            ...a,
            isDefault: a._id === address._id
          }));

          this.selectedAddress =
            this.addressList.find(a => a._id === this.selectedAddress?._id) ||
            address;

          this.toaster.success('Default address updated');
        },

        error: (err: any) => {
          console.error('Set default address error:', err);
          this.toaster.error(
            err?.error?.message || 'Failed to update default address'
          );
        },

        complete: () => {
          this.settingDefaultAddressId = null;
        }
      });
  }

  // ----------------------------------
  // DELETE ADDRESS
  // ----------------------------------

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

  // ----------------------------------
  // BACK TO PRODUCT
  // ----------------------------------

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // ----------------------------------
  // CONTINUE CHECKOUT
  // ----------------------------------

  async continueCheckout(): Promise<void> {

    if (this.isProcessingPayment) {
      return;
    }

    if (!this.userId) {
      this.toaster.warning('Please login first');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.product?._id || !this.selectedVariant?._id) {
      this.toaster.error('Product details are missing');
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

    if (this.hasOutOfStock()) {
      this.toaster.error('Selected quantity is not available');
      return;
    }

    await this.openRazorpayCheckout();
  }

  // ----------------------------------
  // RAZORPAY SCRIPT
  // ----------------------------------

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
          () => reject(new Error('Unable to load Razorpay')),
          { once: true }
        );
        return;
      }

      const script = document.createElement('script');

      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Unable to load Razorpay'));

      document.body.appendChild(script);
    });
  }

  // ----------------------------------
  // OPEN RAZORPAY
  // ----------------------------------

  async openRazorpayCheckout(): Promise<void> {

    this.isProcessingPayment = true;

    try {

      await this.loadRazorpayScript();

      const payload = {
        items: [
          {
            productId: this.product._id,
            variantId: this.selectedVariant._id,
            quantity: this.quantity
          }
        ],
        addressId: this.selectedAddress._id
      };

      const response: any = await new Promise((resolve, reject) => {

        const sub = this.orderService.createRazorpayOrder(payload)
          .subscribe({
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
        description: this.product.name || 'Buy Now',
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

      console.error('Razorpay initialization failed:', error);

      this.isProcessingPayment = false;

      this.toaster.error(
        error?.error?.message ||
        error?.message ||
        'Unable to start checkout'
      );
    }
  }

  // ----------------------------------
  // VERIFY PAYMENT
  // ----------------------------------

  private verifyPayment(
    result: any,
    payment: any
  ): void {

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

      this.toaster.warning(
        'Payment response is incomplete. Please check payment status.'
      );
      return;
    }

    this.isVerifyingPayment = true;

    const sub = this.orderService.verifyRazorpayPayment({
      paymentAttemptId: payment.paymentAttemptId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    }).subscribe({

      next: async (verification: any) => {

        const data = verification?.data;
        const status = String(data?.status || '').toUpperCase();

        this.isVerifyingPayment = false;
        this.isProcessingPayment = false;

        // SUCCESS
        if (
          verification?.success &&
          status === 'ORDER_CREATED' &&
          data?.orderId
        ) {
          sessionStorage.removeItem('buyNowCheckout');

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

        // DEFINITE FAILURE
        if (
          status === 'FAILED' ||
          status === 'PAYMENT_FAILED'
        ) {
          await this.router.navigate(['/payment-failure'], {
            replaceUrl: true,
            state: {
              paymentState: 'failure',
              status: data.status,
              paymentAttemptId: payment.paymentAttemptId,
              paymentId: razorpay_payment_id,
              orderId: data?.orderId || null,
              amount: Number(payment.amount) / 100,
              message:
                verification?.message ||
                data?.message ||
                'Your payment has failed. Please try again.'
            }
          });

          return;
        }

        // PENDING / UNKNOWN STATUS
        // Do not show a false success or failure.
        this.toaster.warning(
          'Payment is being confirmed. Please check your order status.'
        );
      },

      error: (err: any) => {

        console.error('Payment verification failed:', err);

        this.isVerifyingPayment = false;
        this.isProcessingPayment = false;

        // Verification API error does not prove payment failure.
        this.toaster.warning(
          'Unable to verify payment right now. Please check your order status before retrying.'
        );
      }
    });

    this.subscriptions.add(sub);
  }
  onPincodeFocus(): void {

    this.filteredPincodes = this.serviceablePincodes.slice(0, 50);

    this.showPincodeDropdown = true;

  }

  onPincodeSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    const value = input.value.replace(/\D/g, '').slice(0, 6);

    this.pincodeSearch = value;

    this.addressForm.patchValue({
      pincode: ''
    });

    this.isPincodeVerified = false;

    this.isCheckingPincode = false;

    this.pincodeVerificationError = '';

    this.filteredPincodes = this.serviceablePincodes
      .filter(pin => pin.includes(value))
      .slice(0, 50);

    this.showPincodeDropdown = true;

  }

  selectPincode(pincode: string): void {

    this.pincodeSearch = pincode;

    this.showPincodeDropdown = false;

    this.addressForm.patchValue({
      pincode: pincode
    });

    this.verifyPincode(pincode);

  }
  verifyPincode(pincode: string): void {

    this.isPincodeVerified = false;

    this.isCheckingPincode = true;

    this.pincodeVerificationError = '';

    this.orderService.checkPincode(pincode).subscribe({

      next: (response: any) => {

        this.isCheckingPincode = false;

        if (response?.success && response?.data) {

          this.isPincodeVerified = true;

          this.pincodeVerificationError = '';

          this.addressForm.patchValue({

            city: response.data.city || '',

            state: response.data.state || ''

          });

          this.toaster.success('PIN Code verified successfully');

        } else {

          this.isPincodeVerified = false;

          this.pincodeVerificationError =
            response?.message || 'PIN Code is not serviceable.';

          this.addressForm.patchValue({
            city: '',
            state: ''
          });

        }

      },

      error: (error: any) => {

        console.error('Pincode verification failed:', error);

        this.isCheckingPincode = false;

        this.isPincodeVerified = false;

        this.pincodeVerificationError =
          error?.error?.message || 'Unable to verify PIN Code.';

        this.addressForm.patchValue({
          city: '',
          state: ''
        });

      }

    });

  }
  onAddressModalClick(event: MouseEvent): void {

    const target = event.target as HTMLElement;

    if (target.closest('.pincode-field')) {
      return;
    }

    this.showPincodeDropdown = false;

  }
}
