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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
