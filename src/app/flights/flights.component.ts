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

  constructor(private service: serviceFlights) {
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
    this.selectCurrency = e.value;
  }

  clear(){
    this.journey = null;
    this.searchFligth = null;
    this.formAir.reset();
  }
}

