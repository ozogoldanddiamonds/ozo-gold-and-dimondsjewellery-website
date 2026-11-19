import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrdersService } from '../service/orders.service';

@Component({
  selector: 'app-delivery-tracking',
  templateUrl: './delivery-tracking.component.html',
  styleUrls: ['./delivery-tracking.component.css']
})
export class DeliveryTrackingComponent implements OnInit {

  orderId = '';
  trackingData: any = null;
  loading = false;
  errorMessage = '';

  timelineSteps = [
    { code: 'SCREATED', title: 'Pickup Requested', icon: 'fa fa-box' },
    { code: 'SCHECKIN', title: 'Shipment Picked Up', icon: 'fa fa-truck' },
    { code: 'SLINREC', title: 'Received at Origin Hub', icon: 'fa fa-building' },
    { code: 'SLINORIN', title: 'Departed from Origin Hub', icon: 'fa fa-truck' },
    { code: 'SLINDEST', title: 'Arrived at Destination Hub', icon: 'fa fa-map-marker' },
    { code: 'SDELASN', title: 'Out for Delivery', icon: 'fa fa-motorcycle' },
    { code: 'SDELVD', title: 'Delivered Successfully', icon: 'fa fa-home' }
  ];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrdersService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.orderId = params.get('orderId') || '';

      if (!this.orderId) {
        this.errorMessage = 'Invalid order details.';
        return;
      }

      this.getTracking();
    });
  }

  // GET TRACKING
  getTracking(): void {
    if (this.loading || !this.orderId) return;

    this.loading = true;
    this.errorMessage = '';

    this.orderService
      .getCustomerShipmentTracking(this.orderId)
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          if (res?.success && res?.data) {
            this.trackingData = res.data;
          } else {
            this.errorMessage =
              res?.message || 'Tracking information not available.';
          }
        },
        error: (err) => {
          this.loading = false;

          this.errorMessage =
            err.error?.message || 'Unable to fetch tracking details.';

          this.toastr.error(this.errorMessage, 'Tracking Error');
        }
      });
  }

  // ORDER DETAILS
  get orderDetails(): any {
    return this.trackingData?.orderDetails || {};
  }

  // SHIPMENT DETAILS
  get shipmentDetails(): any {
    return this.trackingData?.shipmentDetails || {};
  }

  // TRACKING HISTORY
  get trackingHistory(): any[] {
    return this.trackingData?.tracking || [];
  }

  // CURRENT STATUS
  get currentStatus(): string {
    return this.shipmentDetails?.shipmentStatus || '';
  }

  getStatusLabel(status: string): string {
    const statuses: any = {
      SCREATED: 'Pickup Requested',
      SCHECKIN: 'Picked Up',
      SLINREC: 'Received at Origin Hub',
      SLINORIN: 'Departed from Origin Hub',
      SLINDEST: 'Arrived at Destination Hub',
      SDELASN: 'Out for Delivery',
      SDELVD: 'Delivered Successfully',
      SCANCELLED: 'Shipment Cancelled'
    };

    return statuses[status] || status || 'Tracking Pending';
  }

  get isDelivered(): boolean {
    return this.currentStatus === 'SDELVD';
  }

  get isCancelled(): boolean {
    return this.currentStatus === 'SCANCELLED';
  }

  // TIMELINE CURRENT STEP
  get currentStepIndex(): number {
    if (this.isCancelled) return -1;

    return this.timelineSteps.findIndex(
      step => step.code === this.currentStatus
    );
  }

  getStepState(index: number): string {
    if (this.isCancelled) return 'pending';

    if (this.currentStepIndex === -1) return 'pending';

    if (index < this.currentStepIndex) return 'completed';

    if (index === this.currentStepIndex) return 'current';

    return 'pending';
  }

  // ACTUAL EVENT MATCHING
  getStepEvent(code: string): any {
    const descriptions: any = {
      SCREATED: [
        'pickup requested',
        'shipment is created',
        'shipment created'
      ],
      SCHECKIN: [
        'picked up',
        'shipment picked up'
      ],
      SLINREC: [
        'received at origin',
        'origin hub'
      ],
      SLINORIN: [
        'departed from origin',
        'departured from origin'
      ],
      SLINDEST: [
        'arrived at destination',
        'destination hub'
      ],
      SDELASN: [
        'out for delivery'
      ],
      SDELVD: [
        'delivered'
      ]
    };

    return this.trackingHistory.find(event => {

      if (event.code && event.code === code) {
        return true;
      }

      const description =
        (event.description || '').toLowerCase();

      return (descriptions[code] || []).some(
        (keyword: string) => description.includes(keyword)
      );
    });
  }

  getStepDate(code: string): string {
    return this.getStepEvent(code)?.date_time || '';
  }

  getStepLocation(code: string): string {
    return this.getStepEvent(code)?.location || '';
  }

  // PRODUCT IMAGE
  getProductImage(item: any): string {
    return item?.productImage ||
      item?.productImages?.[0] ||
      'assets/images/no-image.png';
  }

  // TOTAL ITEMS
  get totalQuantity(): number {
    return (this.orderDetails.items || []).reduce(
      (total: number, item: any) =>
        total + Number(item.quantity || 0),
      0
    );
  }

  // EXTERNAL TRACKING
  openExternalTracking(): void {
    const link = this.shipmentDetails?.trackingLink;

    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  }

}
