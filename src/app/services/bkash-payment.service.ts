import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {BkashPaymentInit} from '../interface/bkash.interface';

const API_BKASH = environment.apiBaseUrl + '/api/bkash-payment/'

@Injectable({
  providedIn: 'root'
})
export class BkashPaymentService {

  constructor(
    private http: HttpClient
  ) { }


  /**
   * createPayment()
   * executePayment()
   * queryPayment()
   */
  createPayment(data: any) {
    return this.http.post<{success: boolean, message: string, data: BkashPaymentInit}>(API_BKASH + 'create-payment', data)
  }

  executePayment(paymentID: string) {
    return this.http.post<{success: boolean, message: string, data: any}>(API_BKASH + 'execute-payment', {paymentID})
  }

  queryPayment(paymentID: string) {
    return this.http.get<{success: boolean, message: string, data: any}>(API_BKASH + 'query-payment/' + paymentID)
  }



}
