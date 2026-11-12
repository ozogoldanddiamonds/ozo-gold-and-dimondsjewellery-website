import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AddressService } from '../service/address.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

interface Address {
  _id: string;
  user: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  landmark?: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.css']
})
export class UserAddressComponent implements OnInit {

  addressList: Address[] = [];

  addressForm!: FormGroup;

  userId: string | null = null;

  addressLoading = false;
  isSavingAddress = false;

  showAddressModal = false;
  showDeleteAddressModal = false;

  isEditAddressMode = false;
  editingAddressId: string | null = null;

  addressFormError = '';
  addressError = '';

  settingDefaultAddressId: string | null = null;
  deletingAddressId: string | null = null;

  addressToDelete: Address | null = null;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private toaster: ToastrService
  ) { }

  ngOnInit(): void {
    this.userId = this.getLoggedInUserId();

    this.initializeAddressForm();

    if (this.userId) {
      this.getAddresses();
    } else {
      this.addressError = 'Please login to view your addresses.';
    }
  }

  initializeAddressForm(): void {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      landmark: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      country: ['India', Validators.required],
      isDefault: [false]
    });
  }

  getAddresses(): void {
    if (!this.userId) return;

    this.addressLoading = true;
    this.addressError = '';

    this.addressService.getAddresses(this.userId).subscribe({
      next: (response: any) => {
        if (response?.success) {
          // API response lo empty {} record vasthe remove chesthunnam.
          this.addressList = (response.data || []).filter(
            (address: any) => address?._id && address?.fullName
          );

          // Default address lekapothe first address ni selected/default ga assume cheyyakudadhu.
          // Actual default status API nunchi vachinatte display cheyyali.
        } else {
          this.addressList = [];
          this.addressError = response?.message || 'Unable to fetch addresses.';
        }

        this.addressLoading = false;
      },
      error: (error: any) => {
        console.error('Get addresses error:', error);
        this.addressList = [];
        this.addressLoading = false;
        this.addressError =
          error?.error?.message || 'Failed to load addresses.';
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

  editAddress(address: Address): void {
    if (!address?._id) return;

    this.isEditAddressMode = true;
    this.editingAddressId = address._id;
    this.addressFormError = '';
    this.showAddressModal = true;

    this.addressForm.reset();

    this.addressService.getAddressById(address._id).subscribe({
      next: (response: any) => {
        if (!response?.success || !response?.data) {
          this.addressFormError =
            response?.message || 'Address not found.';
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
        console.error('Get address by ID error:', error);
        this.addressFormError =
          error?.error?.message || 'Unable to load address details.';
      }
    });
  }

  closeAddressModal(): void {
    if (this.isSavingAddress) return;

    this.showAddressModal = false;
    this.isEditAddressMode = false;
    this.editingAddressId = null;
    this.addressFormError = '';
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    if (!this.userId) {
      this.toaster.warning('Please login to manage your address.');
      return;
    }

    this.isSavingAddress = true;
    this.addressFormError = '';

    const formValue = this.addressForm.getRawValue();

    const payload = {
      user: this.userId,
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

    const request$ =
      this.isEditAddressMode && this.editingAddressId
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

        // API default status ni update cheyyakapothe separate default API call.
        if (payload.isDefault && !savedAddress.isDefault) {
          this.addressService.setDefaultAddress(savedAddress._id).subscribe({
            next: (defaultResponse: any) => {
              if (!defaultResponse?.success) {
                this.finishAddressSave(savedAddress);
                this.toaster.warning(
                  'Address saved, but setting it as default failed.'
                );
                return;
              }

              savedAddress.isDefault = true;
              this.finishAddressSave(savedAddress);
            },
            error: (error: any) => {
              console.error('Set default error:', error);
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
        console.error('Save address error:', error);
        this.isSavingAddress = false;
        this.addressFormError =
          error?.error?.message || 'Failed to save address.';
      }
    });
  }

  private finishAddressSave(address: Address): void {
    const wasEdit = this.isEditAddressMode;

    this.addressList = [
      address,
      ...this.addressList.filter(item => item._id !== address._id)
    ];

    if (address.isDefault) {
      this.addressList = this.addressList.map(item => ({
        ...item,
        isDefault: item._id === address._id
      }));
    }

    this.showAddressModal = false;
    this.isSavingAddress = false;
    this.isEditAddressMode = false;
    this.editingAddressId = null;
    this.addressFormError = '';

    this.toaster.success(
      wasEdit ? 'Address updated successfully.' : 'Address saved successfully.'
    );

    // Server response and local list sync kosam refresh.
    this.getAddresses();
  }

  setDefaultAddress(address: Address): void {
    if (
      !address?._id ||
      address.isDefault ||
      this.settingDefaultAddressId
    ) {
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

        this.addressList = this.addressList.map(item => ({
          ...item,
          isDefault: item._id === address._id
        }));

        this.toaster.success('Default address updated successfully.');
      },
      error: (error: any) => {
        console.error('Set default address error:', error);
        this.toaster.error(
          error?.error?.message || 'Failed to update default address.'
        );
      },
      complete: () => {
        this.settingDefaultAddressId = null;
      }
    });
  }

  deleteAddress(address: Address): void {
    if (!address?._id || this.deletingAddressId) return;

    this.addressToDelete = address;
    this.showDeleteAddressModal = true;
  }

  closeDeleteAddressModal(): void {
    if (this.deletingAddressId) return;

    this.showDeleteAddressModal = false;
    this.addressToDelete = null;
  }

  confirmDeleteAddress(): void {
    const address = this.addressToDelete;

    if (!address?._id || this.deletingAddressId) return;

    this.deletingAddressId = address._id;

    this.addressService.deleteAddress(address._id).subscribe({
      next: (response: any) => {
        if (!response?.success) {
          this.toaster.error(
            response?.message || 'Unable to delete address.'
          );
          return;
        }

        const wasDefault = address.isDefault;

        this.addressList = this.addressList.filter(
          item => item._id !== address._id
        );

        this.showDeleteAddressModal = false;
        this.addressToDelete = null;

        if (wasDefault && this.addressList.length > 0) {
          const nextDefault = this.addressList[0];

          this.addressService.setDefaultAddress(nextDefault._id).subscribe({
            next: (defaultResponse: any) => {
              if (!defaultResponse?.success) {
                this.toaster.warning(
                  'Address deleted. Please set another default address.'
                );
                this.getAddresses();
                return;
              }

              this.addressList = this.addressList.map(item => ({
                ...item,
                isDefault: item._id === nextDefault._id
              }));

              this.toaster.success(
                'Address deleted and default address updated.'
              );
            },
            error: (error: any) => {
              console.error('Set next default error:', error);
              this.toaster.warning(
                'Address deleted. Please set another default address.'
              );
              this.getAddresses();
            }
          });
        } else {
          this.toaster.success('Address deleted successfully.');
        }
      },
      error: (error: any) => {
        console.error('Delete address error:', error);
        this.toaster.error(
          error?.error?.message || 'Failed to delete address.'
        );
      },
      complete: () => {
        this.deletingAddressId = null;
      }
    });
  }

  private getLoggedInUserId(): string | null {
    const directUserId =
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id');

    if (directUserId) return directUserId;

    const possibleKeys = ['currentUser', 'user', 'loginUser'];

    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        const id =
          parsed?._id ||
          parsed?.id ||
          parsed?.user?._id ||
          parsed?.user?.id;

        if (id) return id;
      } catch {
        if (raw.length > 10) return raw;
      }
    }

    return null;
  }
}
