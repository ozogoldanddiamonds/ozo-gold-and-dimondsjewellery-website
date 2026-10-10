import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { JewelleryType, MetalType, GoldPurity, GoldColor, StoneType, DiamondType, ContactMethod, DesignType, CustomDesignRequest } from 'src/app/components/models/custom-desigen';
import { AuthService } from 'src/app/service/auth.service';
import { CategoriesService } from 'src/app/service/categories.service';
import { CustomdesignService } from 'src/app/service/customdesign.service';
import { SubcategoryService } from 'src/app/service/subcategory.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-custom-design',
  templateUrl: './custom-design.component.html',
  styleUrls: ['./custom-design.component.css']
})
export class CustomDesignComponent implements OnInit {

  today: string = new Date().toISOString().split('T')[0];
  isAuthOpen = false;
  // Dropdown options
  jewelleryTypes: JewelleryType[] = [
    'RING',
    'NECKLACE',
    'EARRINGS',
    'BANGLES',
    'BRACELET',
    'CHAIN',
    'PENDANT',
    'OTHER'
  ];

  metalTypes: MetalType[] = [
    'GOLD',
    'GOLD_DIAMOND',
    'SILVER',
    'PLATINUM'
  ];

  goldPurities: GoldPurity[] = ['18K', '22K', '24K'];

  goldColors: GoldColor[] = ['YELLOW', 'WHITE', 'ROSE'];

  stoneTypes: StoneType[] = ['NONE', 'DIAMOND', 'GEMSTONE'];

  diamondTypes: DiamondType[] = ['NATURAL', 'LAB_GROWN'];

  contactMethods: ContactMethod[] = [
    'WHATSAPP',
    'PHONE',
    'EMAIL'
  ];

  // Form data
  formData = {
    jewelleryType: '' as JewelleryType | '',
    designType: 'NEW_DESIGN' as DesignType,
    description: '',
    metalType: '' as MetalType | '',
    goldPurity: '' as GoldPurity | '',
    goldColor: '' as GoldColor | '',
    stoneType: 'NONE' as StoneType,
    diamondType: '' as DiamondType | '',
    gemstoneType: '',
    goldWeight: 1,
    requiredDate: '',
    quantity: 1,
    preferredContactMethod: 'WHATSAPP' as ContactMethod,
    additionalNotes: ''
  };

  // Newly selected images
  selectedImages: File[] = [];
  imagePreviews: string[] = [];

  // Images already saved in the database
  existingImageUrls: string[] = [];

  // User's requests
  myRequests: CustomDesignRequest[] = [];
  selectedRequest: CustomDesignRequest | null = null;

  // Edit mode
  isEditMode = false;
  editingRequestId: string | null = null;

  // Loading and messages
  loading = false;
  listLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private customDesignService: CustomdesignService,
    private authService: AuthService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.getMyCustomDesignRequests();
  }

  // =========================================
  // CONDITIONAL FIELD GETTERS
  // =========================================

  get isGoldType(): boolean {
    return (
      this.formData.metalType === 'GOLD' ||
      this.formData.metalType === 'GOLD_DIAMOND'
    );
  }

  get isDiamond(): boolean {
    return this.formData.stoneType === 'DIAMOND';
  }

  get isGemstone(): boolean {
    return this.formData.stoneType === 'GEMSTONE';
  }

  get requiresImages(): boolean {
    return this.formData.designType === 'REFERENCE_DESIGN';
  }

  // =========================================
  // FORM CHANGE HANDLERS
  // =========================================

  onDesignTypeChange(): void {
    if (!this.requiresImages) {
      this.clearImages();
    }
  }

  onMetalTypeChange(): void {
    if (!this.isGoldType) {
      this.formData.goldPurity = '';
      this.formData.goldColor = '';
    }
  }

  onStoneTypeChange(): void {
    if (!this.isDiamond) {
      this.formData.diamondType = '';
    }

    if (!this.isGemstone) {
      this.formData.gemstoneType = '';
    }
  }

  // =========================================
  // IMAGE UPLOAD
  // =========================================

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    this.errorMessage = '';

    if (this.selectedImages.length + files.length > 5) {
      this.errorMessage = 'Maximum 5 images are allowed.';
      input.value = '';
      return;
    }

    // Validate all selected files first
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select image files only.';
        input.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = `${file.name} exceeds the 5 MB limit.`;
        input.value = '';
        return;
      }
    }

    // Validate total images, including saved images
    if (
      this.existingImageUrls.length + this.selectedImages.length + files.length > 5
    ) {
      this.errorMessage = 'Maximum 5 images are allowed in total.';
      input.value = '';
      return;
    }

    for (const file of files) {
      this.selectedImages.push(file);

      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };

      reader.readAsDataURL(file);
    }

    // Allow selecting the same file again later
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  private clearImages(): void {
    this.selectedImages = [];
    this.imagePreviews = [];
  }
  get localUserLoggedIn(): boolean {
    return !!localStorage.getItem('userId') &&
      !!localStorage.getItem('token');
  }
  // =========================================
  // SUBMIT OR UPDATE REQUEST
  // =========================================

  submitRequest(form: NgForm): void {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');


    if (!userId) {

      this.toastr.warning(
        'Please login first'
      );

      this.openLoginModal();

      return;
    }
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (
      this.requiresImages &&
      this.selectedImages.length === 0 &&
      this.existingImageUrls.length === 0
    ) {
      this.errorMessage = 'Please upload at least one reference image.';
      return;
    }

    if (this.isGoldType && !this.formData.goldPurity) {
      this.errorMessage = 'Please select gold purity.';
      return;
    }

    if (this.isGoldType && !this.formData.goldColor) {
      this.errorMessage = 'Please select gold color.';
      return;
    }

    if (this.isDiamond && !this.formData.diamondType) {
      this.errorMessage = 'Please select diamond type.';
      return;
    }

    if (
      this.isGemstone &&
      !this.formData.gemstoneType.trim()
    ) {
      this.errorMessage = 'Please enter gemstone type.';
      return;
    }

    if (this.formData.goldWeight < 0.1) {
      this.errorMessage = 'Gold weight must be at least 0.1 grams.';
      return;
    }

    if (this.formData.quantity < 1) {
      this.errorMessage = 'Quantity must be at least 1.';
      return;
    }

    // Build multipart form data
    const payload = new FormData();

    payload.append('jewelleryType', this.formData.jewelleryType);
    payload.append('designType', this.formData.designType);
    payload.append('description', this.formData.description.trim());
    payload.append('metalType', this.formData.metalType);
    payload.append('stoneType', this.formData.stoneType);
    payload.append('goldWeight', String(this.formData.goldWeight));
    payload.append('quantity', String(this.formData.quantity));

    payload.append(
      'preferredContactMethod',
      this.formData.preferredContactMethod
    );

    if (this.formData.goldPurity) {
      payload.append('goldPurity', this.formData.goldPurity);
    }

    if (this.formData.goldColor) {
      payload.append('goldColor', this.formData.goldColor);
    }

    if (this.formData.diamondType) {
      payload.append('diamondType', this.formData.diamondType);
    }

    if (this.formData.gemstoneType.trim()) {
      payload.append(
        'gemstoneType',
        this.formData.gemstoneType.trim()
      );
    }

    if (this.formData.requiredDate) {
      payload.append('requiredDate', this.formData.requiredDate);
    }

    if (this.formData.additionalNotes.trim()) {
      payload.append(
        'additionalNotes',
        this.formData.additionalNotes.trim()
      );
    }

    // Send only newly selected files.
    // Backend must preserve existing images when no new files are sent.
    this.selectedImages.forEach(file => {
      payload.append('referenceImages', file);
    });

    this.loading = true;

    // UPDATE API in edit mode; CREATE API otherwise
    const request$ =
      this.isEditMode && this.editingRequestId
        ? this.customDesignService.updateCustomDesignRequest(
          this.editingRequestId,
          payload
        )
        : this.customDesignService.createCustomDesignRequest(payload);

    request$.subscribe({
      next: response => {
        this.loading = false;

        if (response.success && response.data) {
          const wasEditing = this.isEditMode;

          this.selectedRequest = response.data;

          this.successMessage =
            response.message ||
            (wasEditing
              ? 'Custom design request updated successfully.'
              : 'Custom design request submitted successfully.');

          // Exit edit mode after a successful save
          this.isEditMode = false;
          this.editingRequestId = null;
          this.existingImageUrls = [];

          // Reset form
          form.resetForm({
            designType: 'NEW_DESIGN',
            stoneType: 'NONE',
            goldWeight: 1,
            quantity: 1,
            preferredContactMethod: 'WHATSAPP'
          });

          this.resetFormData();
          this.clearImages();

          // Refresh this user's requests
          this.getMyCustomDesignRequests();
        } else {
          this.errorMessage =
            response.message || 'Unable to save request.';
        }
      },

      error: error => {
        this.loading = false;

        this.errorMessage =
          error.error?.message ||
          'Something went wrong. Please try again.';
      }
    });
  }

  // =========================================
  // RESET FORM DATA
  // =========================================

  private resetFormData(): void {
    this.formData = {
      jewelleryType: '',
      designType: 'NEW_DESIGN',
      description: '',
      metalType: '',
      goldPurity: '',
      goldColor: '',
      stoneType: 'NONE',
      diamondType: '',
      gemstoneType: '',
      goldWeight: 1,
      requiredDate: '',
      quantity: 1,
      preferredContactMethod: 'WHATSAPP',
      additionalNotes: ''
    };
  }

  // =========================================
  // GET CURRENT USER'S REQUESTS
  // =========================================

  getMyCustomDesignRequests(): void {
    this.listLoading = true;

    this.customDesignService
      .getMyCustomDesignRequests()
      .subscribe({
        next: response => {
          this.listLoading = false;
          this.myRequests = response.data || [];
        },

        error: error => {
          this.listLoading = false;

          console.error(
            'Unable to load custom design requests',
            error
          );
        }
      });
  }

  // =========================================
  // EDIT REQUEST - PATCH DATA INTO FORM
  // =========================================

  editRequest(request: CustomDesignRequest): void {
    this.isEditMode = true;
    this.editingRequestId = request._id;

    this.selectedRequest = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.formData = {
      jewelleryType: request.jewelleryType || '',
      designType: request.designType || 'NEW_DESIGN',
      description: request.description || '',
      metalType: request.metalType || '',
      goldPurity: request.goldPurity || '',
      goldColor: request.goldColor || '',
      stoneType: request.stoneType || 'NONE',
      diamondType: request.diamondType || '',
      gemstoneType: request.gemstoneType || '',
      goldWeight: request.goldWeight ?? 1,
      requiredDate: request.requiredDate
        ? String(request.requiredDate).substring(0, 10)
        : '',
      quantity: request.quantity ?? 1,
      preferredContactMethod:
        request.preferredContactMethod || 'WHATSAPP',
      additionalNotes: request.additionalNotes || ''
    };

    this.clearImages();

    // Normalize saved images into URLs
    const images: any = (request as any).referenceImages || [];

    this.existingImageUrls = images
      .map((image: any) => {
        if (typeof image === 'string') {
          return image;
        }

        return image?.url || image?.secure_url || '';
      })
      .filter((url: string) => !!url);

    console.log('Existing image URLs:', this.existingImageUrls);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // =========================================
  // CANCEL EDIT
  // =========================================

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingRequestId = null;
    this.existingImageUrls = [];

    this.errorMessage = '';
    this.successMessage = '';

    this.resetFormData();
    this.clearImages();
  }

  // =========================================
  // VIEW REQUEST DETAILS
  // =========================================

  viewRequest(request: CustomDesignRequest): void {
    this.selectedRequest = request;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeDetails(): void {
    this.selectedRequest = null;
  }

  // =========================================
  // TRACK REQUEST ROWS
  // =========================================

  trackByRequestId(
    index: number,
    request: CustomDesignRequest
  ): string {
    return request._id;
  }

  openLoginModal() {

    this.isAuthOpen = true;

  }
  closeAuthModal(isLoggedIn?: boolean) {

    this.isAuthOpen = false;

  }
}