import { Component } from '@angular/core';

@Component({
  selector: 'app-help-faq',
  templateUrl: './help-faq.component.html',
  styleUrls: ['./help-faq.component.css']
})
export class HelpFaqComponent {
  searchText = '';
  selectedCategory = 'All';
  openIndex: number | null = null;

  categories = [
    'All',
    'Orders',
    'Payments',
    'Shipping',
    'Returns',
    'Jewellery'
  ];

  faqs: any = [
    {
      category: 'Orders',
      question: 'How can I place an order?',
      answer:
        'Browse our jewellery collections, select your preferred product and available variant, add it to your cart and follow the checkout process to place your order.'
    },
    {
      category: 'Orders',
      question: 'How can I track my order?',
      answer:
        'Once order tracking is available for your purchase, use the tracking details provided by OZO or contact our customer support team for assistance.'
    },
    {
      category: 'Orders',
      question: 'Can I cancel or modify my order?',
      answer:
        'Order cancellation or modification depends on the current order status and product processing stage. Please contact customer support as soon as possible.'
    },
    {
      category: 'Payments',
      question: 'Which payment methods are accepted?',
      answer:
        'Available payment methods will be displayed during checkout. Please check the checkout page for the payment options currently supported.'
    },
    {
      category: 'Payments',
      question: 'What should I do if my payment fails?',
      answer:
        'Check whether the amount was deducted from your account. If it was deducted but your order was not confirmed, contact customer support with your transaction details.'
    },
    {
      category: 'Shipping',
      question: 'How long does delivery take?',
      answer:
        'Delivery timelines may vary depending on product availability, customisation and your delivery location. Refer to the estimated delivery details provided with your order.'
    },
    {
      category: 'Shipping',
      question: 'Do you deliver to my location?',
      answer:
        'Delivery availability depends on your address and the serviceability of your location. Check your delivery details during checkout or contact our team.'
    },
    {
      category: 'Returns',
      question: 'Can I return or exchange jewellery?',
      answer:
        'Returns and exchanges are subject to OZO’s applicable policies and the product category. Please review the official return policy or contact customer support before initiating a request.'
    },
    {
      category: 'Jewellery',
      question: 'Are your jewellery products certified?',
      answer:
        'Certification and hallmark information depend on the specific product. Check the product details page for the certification information available for your selected item.'
    },
    {
      category: 'Jewellery',
      question: 'How should I care for my jewellery?',
      answer:
        'Store jewellery separately in a clean, dry place. Avoid direct contact with perfumes, chemicals and harsh cleaning products. Use appropriate jewellery-cleaning methods for the specific metal and stones.'
    }
  ];

  get filteredFaqs(): any {
    const search = this.searchText.trim().toLowerCase();

    return this.faqs.filter((faq: any) => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        faq.category === this.selectedCategory;

      const matchesSearch =
        !search ||
        faq.question.toLowerCase().includes(search) ||
        faq.answer.toLowerCase().includes(search) ||
        faq.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.openIndex = null;
  }

  toggleFaq(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
