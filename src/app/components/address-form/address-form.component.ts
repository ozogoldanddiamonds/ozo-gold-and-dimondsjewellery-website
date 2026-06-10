import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.css']
})
export class AddressFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() submitLabel: string = 'Save Address';

  @Output() submitForm = new EventEmitter<any>();
  @Output() cancelForm = new EventEmitter<void>();

  onSubmit() {
    console.log('child submit clicked');
    console.log(this.formGroup.value);

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.submitForm.emit(this.formGroup.value);
  }

  onCancel() {
    this.cancelForm.emit();
  }
}
