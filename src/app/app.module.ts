import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { CartComponent } from './components/cart/cart.component';
import { PaymentComponent } from './components/payment/payment.component';
import { FooterComponent } from './footer/footer.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { WhishlistComponent } from './components/whishlist/whishlist.component';
import { ProductComponent } from './components/product/product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthModalComponent } from './shared/auth-modal/auth-modal.component';
import { ToastrModule } from 'ngx-toastr';
import { LoaderComponent } from './components/loader/loader.component';
import { BuyProductComponent } from './components/buy-product/buy-product.component';
import { ProceedPaymentComponent } from './components/proceed-payment/proceed-payment.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { AddressManagmentComponent } from './components/address-managment/address-managment.component';
import { ProfileComponent } from './components/profile/profile.component';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    CartComponent,
    PaymentComponent,
    FooterComponent,
    CategoriesComponent,
    WhishlistComponent,
    ProductComponent,
    AuthModalComponent,
    LoaderComponent,
    BuyProductComponent,
    ProceedPaymentComponent,
    AddressFormComponent,
    AddressManagmentComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true
    })

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
