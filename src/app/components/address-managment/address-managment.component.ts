import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AddressService } from 'src/app/service/address.service';

@Component({
  selector: 'app-address-managment',
  templateUrl: './address-managment.component.html',
  styleUrls: ['./address-managment.component.css']
})
export class AddressManagmentComponent implements OnInit {
  userId = localStorage.getItem('userId') || '';
  addresses: any[] = [];
  selectedAddress: any = null;

  isModalOpen = false;
  modalMode: 'add' | 'manage' = 'add';
  manageTab: 'list' | 'add' = 'list';
  editingAddress: any = null;

  addressForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private toastr: ToastrService
  ) { }

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
    if (!this.userId) return;

    this.addressService.getAddresses(this.userId).subscribe({
      next: (res: any) => {
        console.log(res, 'manage address list');
        this.addresses = res?.data || [];
        this.selectedAddress = this.addresses.find((a: any) => a.isDefault) || this.addresses[0] || null;
      },
      error: () => {
        this.addresses = [];
      }
    });
  }

  selectAddress(addr: any) {
    this.selectedAddress = addr;
  }

  openAddModal() {
    this.modalMode = 'add';
    this.manageTab = 'add';
    this.editingAddress = null;
    this.isModalOpen = true;
    this.addressForm.reset({
      user: this.userId,
      country: 'India',
      isDefault: false
    });
  }

  openManageModal(addr?: any, event?: Event) {
    if (event) event.stopPropagation();
    this.modalMode = 'manage';
    this.manageTab = 'list';
    this.isModalOpen = true;
    if (addr) this.editingAddress = addr;
  }

  switchToAdd() {
    this.modalMode = 'add';
    this.manageTab = 'add';
    this.editingAddress = null;
    this.addressForm.reset({
      user: this.userId,
      country: 'India',
      isDefault: false
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingAddress = null;
    this.manageTab = 'list';
  }

  editAddress(addr: any, event?: Event) {
    if (event) event.stopPropagation();

    this.modalMode = 'add';
    this.manageTab = 'add';
    this.editingAddress = addr;
    this.isModalOpen = true;

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

  saveAddress(formValue: any) {
    const payload = {
      ...formValue,
      user: this.userId
    };

    if (this.editingAddress?._id) {
      this.addressService.updateAddress(this.editingAddress._id, payload).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Address updated successfully');
          this.closeModal();
          this.getAddresses();
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to update address');
        }
      });
    } else {
      this.addressService.createAddress(payload).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message || 'Address saved successfully');
          this.closeModal();
          this.getAddresses();
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to save address');
        }
      });
    }
  }

  deleteAddress(addr: any, event?: Event) {
    if (event) event.stopPropagation();
    this.toastr.info('Delete API not connected yet');
  }

}
