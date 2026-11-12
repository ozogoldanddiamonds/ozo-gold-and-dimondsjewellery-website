import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../service/orders.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  orders: any[] = [];

  isLoading = false;
  errorMessage = '';

  expandedOrderId: string | null = null;

  constructor(
    private orderService: OrdersService,
    private toaster: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.errorMessage = 'Please login to view your orders.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrdersByUser(userId).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.orders = (response.data || []).filter(
            (order: any) => order?._id
          );
        } else {
          this.orders = [];
          this.errorMessage =
            response?.message || 'Unable to load your orders.';
        }

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Get orders error:', error);

        this.orders = [];
        this.isLoading = false;

        this.errorMessage =
          error?.error?.message || 'Failed to load orders. Please try again.';
      }
    });
  }

  // toggleOrderDetails(orderId: string): void {
  //   this.expandedOrderId =
  //     this.expandedOrderId === orderId ? null : orderId;
  // }

  // isExpanded(orderId: string): boolean {
  //   return this.expandedOrderId === orderId;
  // }

  getOrderItems(order: any): any[] {
    return Array.isArray(order?.items) ? order.items : [];
  }

  getItemName(item: any): string {
    return (
      item?.productSnapshot?.name ||
      item?.product?.name ||
      item?.productName ||
      'Jewellery Product'
    );
  }

  getItemImage(item: any): string {
    return (
      item?.productSnapshot?.image ||
      item?.product?.images?.[0]?.url ||
      item?.product?.images?.[0] ||
      item?.image ||
      'assets/images/product-placeholder.png'
    );
  }

  getItemQuantity(item: any): number {
    return Number(item?.quantity || 1);
  }

  getItemPrice(item: any): number {
    return Number(item?.totalPrice ?? item?.unitPrice ?? 0);
  }

  getOrderTotal(order: any): number {
    return Number(order?.totalAmount ?? 0);
  }

  // getOrderDate(order: any): Date | null {
  //   const date = order?.createdAt || order?.invoiceDate;

  //   return date ? new Date(date) : null;
  // }

  getPaymentStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'paid':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-danger';
      case 'refunded':
        return 'status-refunded';
      default:
        return 'status-neutral';
    }
  }

  getOrderStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'status-success';

      case 'confirmed':
      case 'processing':
      case 'packed':
      case 'shipped':
      case 'out for delivery':
        return 'status-progress';

      case 'cancelled':
      case 'returned':
        return 'status-danger';

      default:
        return 'status-pending';
    }
  }

  getStatusSteps(order: any): any[] {
    const steps = [
      { label: 'Confirmed', icon: 'fa-check-circle' },
      { label: 'Processing', icon: 'fa-cog' },
      { label: 'Packed', icon: 'fa-gift' },
      { label: 'Shipped', icon: 'fa-truck' },
      { label: 'Delivered', icon: 'fa-home' }
    ];

    const status = (order?.orderStatus || '').toLowerCase();

    const statusIndex: { [key: string]: number } = {
      confirmed: 0,
      processing: 1,
      packed: 2,
      shipped: 3,
      'out for delivery': 3,
      delivered: 4,
      completed: 4
    };

    const currentIndex = statusIndex[status] ?? -1;

    return steps.map((step, index) => ({
      ...step,
      completed: currentIndex >= index,
      current: currentIndex === index
    }));
  }

  getDeliveryAddress(order: any): string {
    const address = order?.addressSnapshot || {};

    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.pincode || address.postalCode,
      address.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  getCustomerName(order: any): string {
    return (
      order?.customerDetails?.fullName ||
      order?.customerDetails?.name ||
      order?.user?.name ||
      'Customer'
    );
  }

  trackByOrderId(index: number, order: any): string {
    return order?._id || index.toString();
  }

  private getLoggedInUserId(): string | null {
    const directId =
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id');

    if (directId) return directId;

    for (const key of ['currentUser', 'user', 'loginUser']) {
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

  toggleOrderDetails(orderId: string): void {
    this.expandedOrderId =
      this.expandedOrderId === orderId ? null : orderId;
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrderId === orderId;
  }

  // First purchased product
  getFirstProduct(order: any): any {
    return order?.items?.length ? order.items[0] : null;
  }

  // Product image
  getProductImage(item: any): string {
    return (
      item?.productSnapshot?.image ||
      'assets/images/product-placeholder.png'
    );
  }

  // Product name
  getProductName(item: any): string {
    return (
      item?.productSnapshot?.name ||
      'Product'
    );
  }

  // Product price
  getProductPrice(item: any): number {
    return Number(item?.totalPrice || item?.finalPrice || item?.unitPrice || 0);
  }

  // Product quantity
  getProductQuantity(item: any): number {
    return Number(item?.quantity || 1);
  }

  // Order date
  getOrderDate(order: any): Date | null {
    return order?.createdAt ? new Date(order.createdAt) : null;
  }

  // Total number of products
  getTotalItems(order: any): number {
    return (order?.items || []).reduce(
      (total: number, item: any) =>
        total + Number(item?.quantity || 0),
      0
    );
  }

  // Image fallback
  onProductImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/product-placeholder.png';
  }
}
