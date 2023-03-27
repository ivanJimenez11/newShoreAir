import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { flight } from '../models/flight';
import { journey } from '../models/journey';
import { serviceFlights } from '../services';

function noIguales(control: FormControl) {
  const valor = control?.value;
  const parent = control?.parent;
  if (parent) {
    const otroControl = parent?.get('destination');
    if (otroControl && otroControl?.value === valor) {
      return {
        noIguales: true
      };
    }
  }
  return null;
}

@Component({
  selector: 'app-flights',
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.scss']
})

export class FlightsComponent implements OnInit {

  formAir = new FormGroup({ 
    origin : new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]),
    destination : new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(3)])
  });
  dataSourceFlights: any[] = [];
  flights?: flight;
  dataSourceService: any[] = [];
  journey?: journey | null;
  searchFligth?: flight | null;
  selectCurrency: string
  amountUSD?: number;
  showLoadingCurrency: boolean = false;

  constructor(private service: serviceFlights, private http: HttpClient) {
    this.selectCurrency = "USD"
    this.formAir.controls['origin'].valueChanges.subscribe(value => {
      this.validarIgualdad();
    });

    this.formAir.controls['destination'].valueChanges.subscribe(value => {
      this.validarIgualdad();
    });

    
   }

  ngOnInit(): void {
    this.getFlights();
  }

  getFlights(){
    // this.showloadingTree = true;
    this.dataSourceService = []
    this.service.getFlights().subscribe(
      (data: any) => {
        if (data) {
          this.dataSourceService = data;
          for (let index = 0; index < this.dataSourceService.length; index++) {
            this.flights = {
              origin: this.dataSourceService[index].arrivalStation,
              destination: this.dataSourceService[index].departureStation,
              price: this.dataSourceService[index].price,
              transport: {
                flightCarrier: this.dataSourceService[index].flightCarrier,
                flightNumber: this.dataSourceService[index].flightNumber
              }
            }
            this.dataSourceFlights.push(this.flights)
          }
          // this.showloadingTree = false;
          console.log(this.dataSourceFlights)
        } else {
          alert("Error al consumir el servicio.");
        }
      },
      (err) => {
        alert("Error al consumir el servicio.");
        // this.showloadingTree = false;
      }
    );
  }

  validarIgualdad() {
    if (this.formAir.get('origin')?.value == this.formAir.get('destination')?.value && this.formAir.get('origin')?.value !== '' && this.formAir.get('destination')?.value !== '' && this.formAir.get('origin')?.value !== null  && this.formAir.get('destination')?.value !== null) {
      this.formAir.controls['origin'].setErrors({ noIguales: true });
      this.formAir.controls['destination'].setErrors({ noIguales: true });
    } 
  }

  upperCaseText(formcontrol: string){
  // this.formAir.get('origin')?.value.toUpperCase();
  if (this.formAir.get(formcontrol) !== null) {
    if(formcontrol == "origin"){
      this.formAir.patchValue({
        origin: this.formAir.get(formcontrol)?.value.toUpperCase()
      });
    } else if(formcontrol == "destination"){
      this.formAir.patchValue({
        destination: this.formAir.get(formcontrol)?.value.toUpperCase()
      });
    }
    }
  }

  submit(){
    if(this.formAir.valid){
      this.searchFligth = null;
      this.journey = null;
      let indexSearch = -1;
     for (let index = 0; index < this.dataSourceFlights.length; index++) {
      if(this.dataSourceFlights[index].origin == this.formAir.get('origin')?.value){
        this.searchFligth = this.dataSourceFlights[index];
        indexSearch = index;
        break;
      }
     }
     if(indexSearch !== -1){
      for (let index = indexSearch; index < this.dataSourceFlights.length; index++) {
        if(this.searchFligth?.destination == this.dataSourceFlights[index].origin){
          let flights = [];
          flights.push(this.searchFligth);
          flights.push(this.dataSourceFlights[index]);
          this.journey = {
            origin: this.formAir.get('origin')?.value,
            destination: this.formAir.get('destination')?.value,
            price: this.searchFligth?.price + this.dataSourceFlights[index].price,
            flight: flights          }
        }
     }
     }
     if(this.journey !== null && this.journey !== undefined){
      console.log(this.journey);
     } else {
      alert("No fue posible calcular la ruta.");
     }
    }
  }

  selectCurrencyM(e: any){
    if(e.value){
        this.convertCurrency(this.journey?.price!, e.value);
        // for (let index = 0; index < this.journey?.flight.length!; index++) {
        //   this.convertCurrency(this.journey?.flight[index].price!, e.value, index, "F"); 
        // }
      // this.journey?.price = this.journey?.price
    } else {
      this.selectCurrency = e.value;
    }
  }

  convertCurrency(amount: number, tocurrency: string) {
    const apiKey = 'FhZUDsGClNqWr59NElGoaXH29qj0PXRc';
    const apiEndpoint = 'https://api.apilayer.com/currency_data/live';
    const fromCurrency = 'USD';
    const toCurrency = tocurrency;

    if (!this.amountUSD) {
      this.amountUSD = amount;
    }
  
    const headers = {
      'apikey': apiKey
    };
  
    const params = {
      'base': fromCurrency,
      'symbols': toCurrency
    };
    this.showLoadingCurrency = true;
    this.http.get(apiEndpoint, { headers: headers, params: params }).subscribe((response: any) => {
      this.showLoadingCurrency = false;
      const exchangeRate = response.quotes[`USD${toCurrency}`];
      const convertedAmount = this.amountUSD! * exchangeRate;
      
      if(this.journey?.price !== undefined){
          this.journey.price = convertedAmount;
      }

      if (this.journey?.flight !== undefined) {
          for (let i = 0; i < this.journey.flight.length; i++) {
          const otherPrice = this.journey.flight[i];
          const otherConvertedAmount = otherPrice.price! * exchangeRate;
          otherPrice.price = otherConvertedAmount;
          }
      }
         
        // else if(type == "F") {
        //   if(index !== -1){
        //     if(this.journey?.flight[index].price !== undefined){
        //       this.journey.flight[index].price = convertedAmount;
        //     }
        //   }
        // }
      
      // Usa el valor convertido aquí
    });
  }

  clear(){
    this.journey = null;
    this.searchFligth = null;
    this.formAir.reset();
  }

    showLoading(){
      if(this.showLoadingCurrency){
        return true
      } else {
        return false
      }
    }
}

