import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { CartComponent } from './components/cart/cart.component';
import { WhishlistComponent } from './components/whishlist/whishlist.component';
import { ProductComponent } from './components/product/product.component';
import { BuyProductComponent } from './components/buy-product/buy-product.component';
import { ProceedPaymentComponent } from './components/proceed-payment/proceed-payment.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { UserSchemesPageComponent } from './components/user-schemes-page/user-schemes-page.component';
import { SchemePaymentDetailsComponent } from './components/scheme-payment-details/scheme-payment-details.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'cart', component: CartComponent },
  { path: 'whishlist', component: WhishlistComponent },
  { path: 'product/:id', component: ProductComponent },
  { path: 'buy-product', component: BuyProductComponent },
  { path: 'proceed-payment', component: ProceedPaymentComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  { path: 'schemes-page', component: UserSchemesPageComponent },
  { path: 'scheme-payment/:id', component: SchemePaymentDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
