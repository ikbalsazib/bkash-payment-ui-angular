import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BkashPaymentService} from '../services/bkash-payment.service';
import {BkashPaymentInit} from '../interface/bkash.interface';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';


declare var $: any;
declare var bKash: any;

@Component({
  selector: 'app-bkash-payment',
  templateUrl: './bkash-payment.component.html',
  styleUrls: ['./bkash-payment.component.scss']
})
export class BkashPaymentComponent implements OnInit, OnDestroy {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Bkash Button
  @ViewChild('bkashButton') bkashButton: ElementRef;


  // Store Data
  public bkashPaymentInit: BkashPaymentInit;


  constructor(
    private bkashPaymentService: BkashPaymentService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {

    // Init Data Form
    this.initDataForm();

  }

  /**
   * INIT FORM
   */
  private initDataForm() {
    this.dataForm = this.fb.group({
      amount: [null, Validators.required],
    });
  }

  /**
   * ON SUBMIT FORM
   */
  onSubmit() {
    if (this.dataForm.invalid) {
      console.log('Invalid Form Input')
      return;
    }

    // Init Bkash Payment
    this.initBkashPayment();

    // >>IMPORTANT<< Call Bkash Dialog through [bKash_button] ID
    this.bkashButton.nativeElement.click();


  }

  /**
   * bKash Payment Init
   * initBkashPayment()
   */

  private initBkashPayment() {
    // Re Init Variables for Nested Function Access
    const bkashPaymentService = this.bkashPaymentService;
    let bkashPaymentInit = this.bkashPaymentInit;

    bKash.init({
      paymentMode: 'checkout',
      paymentRequest: {
        amount: this.dataForm.value.amount,
        intent: 'sale',
        currency: 'BDT',
        orderID: '0001'
        // merchantInvoiceNumber: '123456' // Will be the Order No
      },

      createRequest: function (request) {
        bkashPaymentService.createPayment(request)
          .subscribe(res => {
            bkashPaymentInit = res.data;
            if (bkashPaymentInit && bkashPaymentInit.paymentID) {
              bKash.create().onSuccess(bkashPaymentInit);
            }
            else {
              bKash.create().onError();
            }
          }, error => {
            bKash.create().onError();
          });
      }, // Create Payment with backend

      executeRequestOnAuthorization: function () {
        $('#payment_status').val('');
        bkashPaymentService.executePayment(bkashPaymentInit.paymentID)
          .subscribe(res => {
            $('#close_button').click();
            const result = res.data;
            console.log('executeRequestOnAuthorization', result)
            if (result && result.paymentID) {
              $('#bKashFrameWrapper').fadeOut();
              // TODO Goto Success Page
              // TODO Call Backend API
              //Save to Database
              localStorage.setItem('paymentresult', JSON.stringify(result));
              alert('Payment Success')
            } else {
              alert('Something went wrong')
              bKash.execute().onError();
            }
          }, error => {
            console.log(error)
            bKash.execute().onError();
          });
      }, // Execute Payment after bkash verification
      onClose : function () {
        alert('Payment Canceled')
      }
    });
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
  }


}
