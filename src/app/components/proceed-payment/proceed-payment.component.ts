import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AddressService } from 'src/app/service/address.service';

@Component({
  selector: 'app-proceed-payment',
  templateUrl: './proceed-payment.component.html',
  styleUrls: ['./proceed-payment.component.css']
})
export class ProceedPaymentComponent implements OnInit {
  product: any = {};
  selectedVariant: any = {};
  quantity: number = 1;

  // Payment related
  selectedPaymentMethod: string = 'upi';
  calculatedTotal: number = 0;
  userId: string = localStorage.getItem('userId') || '';

  addresses: any[] = [];
  selectedAddress: any = null;

  isAddressModalOpen: boolean = false;
  modalMode: 'add' | 'manage' = 'add';
  manageView: 'list' | 'add' = 'list';
  editingAddress: any = null;
  addressList: any[] = [];

  addressForm!: FormGroup;
  // Form fields
  upiId: string = '';
  cardNumber: string = '';
  cardName: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  selectedBank: string = '';
  selectedWallet: string = '';

  // Promo code
  promoCode: string = '';
  appliedPromo: any = null;

  // Terms
  acceptTerms: boolean = false;

  constructor(private router: Router, private fb: FormBuilder,
    private addressService: AddressService,
    private toastr: ToastrService) {
    this.loadData();
    this.calculateTotal();
  }
  ngOnInit(): void {
    this.initForm();
    this.getAddresses();
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

  getAddresses() {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.selectedAddress = null;

      return;

    }

    this.addressService
      .getAddresses(userId)
      .subscribe({

        next: (res: any) => {

          this.addressList =
            res?.data || [];

          if (
            this.addressList.length > 0
          ) {

            this.selectedAddress =

              this.addressList.find(
                (address: any) =>
                  address.isDefault
              )

              ||

              this.addressList[0];

          }

          else {

            this.selectedAddress = null;

          }

        },

        error: (err) => {

          console.log(err);

          this.selectedAddress = null;

        }

      });

  }
  trackByAddressId(index: number, item: any) {
    return item._id;
  }
  loadData() {
    const paymentData = history.state;
    console.log(paymentData, 'payment data');

    if (paymentData?.product) {
      this.product = paymentData.product;
    }

    if (paymentData?.selectedVariant) {
      this.selectedVariant = paymentData.selectedVariant;
    }

    if (paymentData?.quantity) {
      this.quantity = paymentData.quantity;
    }
  }

  calculateTotal() {
    const finalPrice = this.selectedVariant?.priceBreakup?.finalPrice || 0;
    this.calculatedTotal = finalPrice * this.quantity;
  }

  goBack() {
    this.router.navigate(["/home"]);
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
  }

  applyPromoCode() {
    // Dummy promo code logic
    if (this.promoCode.toUpperCase() === 'SAVE10') {
      this.appliedPromo = {
        code: 'SAVE10',
        discount: this.calculatedTotal * 0.1
      };
      this.calculatedTotal = this.calculatedTotal * 0.9;
    } else {
      alert('Invalid promo code');
    }
  }

  removePromoCode() {
    this.appliedPromo = null;
    this.promoCode = '';
    this.calculateTotal();
  }

  processPayment() {
    if (!this.acceptTerms && this.selectedPaymentMethod !== 'cod') {
      alert('Please accept Terms & Conditions');
      return;
    }

    // Payment validation
    if (this.selectedPaymentMethod === 'upi' && !this.upiId) {
      alert('Please enter UPI ID');
      return;
    }

    if (this.selectedPaymentMethod === 'credit' || this.selectedPaymentMethod === 'debit') {
      if (!this.cardNumber || !this.cardName || !this.cardExpiry || !this.cardCvv) {
        alert('Please fill all card details');
        return;
      }
    }

    if (this.selectedPaymentMethod === 'netbanking' && !this.selectedBank) {
      alert('Please select a bank');
      return;
    }

    if (this.selectedPaymentMethod === 'wallet' && !this.selectedWallet) {
      alert('Please select a wallet');
      return;
    }

    // Process payment (API call here)
    console.log('Processing payment...');
    console.log({
      paymentMethod: this.selectedPaymentMethod,
      amount: this.calculatedTotal,
      product: this.product,
      variant: this.selectedVariant,
      quantity: this.quantity
    });

    // Navigate to success page
    this.router.navigate(['/payment-success'], {
      state: {
        orderId: 'ORD' + Date.now(),
        amount: this.calculatedTotal,
        product: this.product
      }
    });
  }

  openAddAddress() {
    this.modalMode = 'add';
    this.manageView = 'add';
    this.editingAddress = null;
    this.isAddressModalOpen = true;

    this.addressForm.reset({
      user: this.userId,
      country: 'India',
      isDefault: false
    });
  }

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


  saveAddress(formValue: any) {
    console.log('saveAddress fired');
    console.log('raw formValue:', formValue);

    const payload = {
      ...formValue,
      user: this.userId
    };

    console.log('final payload:', payload);

    const request$ = this.editingAddress?._id
      ? this.addressService.updateAddress(this.editingAddress._id, payload)
      : this.addressService.createAddress(payload);
    console.log('Editing Address:', this.editingAddress);
    console.log('Payload:', payload);
    console.log('Request:', request$);
    request$.subscribe({
      next: (res: any) => {
        console.log('API success response:', res);
        this.toastr.success(res?.message || 'Address saved successfully');
        this.closeAddressModal();
        this.getAddresses();
      },
      error: (err) => {
        console.error('API error:', err);
        this.toastr.error(err?.error?.message || 'Failed to save address');
      }
    });
  }
  deleteAddress(event: any) { }
  editAddress(addr: any, event?: Event) {
    if (event) event.stopPropagation();

    this.modalMode = 'add';
    this.manageView = 'add';
    this.editingAddress = addr;
    this.isAddressModalOpen = true;

    this.addressForm.patchValue({
      user: this.userId,
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      isDefault: addr.isDefault
    });
  }
}
