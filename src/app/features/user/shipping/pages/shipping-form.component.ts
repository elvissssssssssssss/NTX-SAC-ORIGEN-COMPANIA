
import { Component, OnInit } from '@angular/core';
import { Envios } from '../../shipping/models/envio.model';
import { EnvioService } from '../../shipping/services/envio.service';
import { AuthService } from '../../../user/auth/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipping-form.component.html',
  styleUrl: './shipping-form.component.css'
})
export class ShippingFormComponent implements OnInit {
  envio: Envios = {
    userId: 0,
  
    direccion: '',
    region: '',
    provincia: '',
    localidad: '',
    dni: '',
    telefono: ''
  };
  
  telefonoSinPrefijo: string = ''; // 👈 aquí se escribe sin +51
   // Arrays para provincias y localidades
  provincias: string[] = [];
  localidades: string[] = [];
    // Datos geográficos del Perú
  private datosGeograficos: { [key: string]: { [key: string]: string[] } } = {
    'Amazonas': {
      'Bagua': ['Bagua', 'Aramango', 'Copallin', 'El Parco', 'Imaza', 'La Peca'],
      'Bongará': ['Jumbilla', 'Chisquilla', 'Churuja', 'Corosha', 'Cuispes', 'Florida'],
      'Chachapoyas': ['Chachapoyas', 'Asunción', 'Balsas', 'Cheto', 'Chiliquin', 'Chuquibamba'],
      'Condorcanqui': ['Nieva', 'El Cenepa', 'Río Santiago'],
      'Luya': ['Lamud', 'Camporredondo', 'Cocabamba', 'Colcamar', 'Conila', 'Inguilpata'],
      'Rodríguez de Mendoza': ['San Nicolás', 'Chirimoto', 'Cochamal', 'Huambo', 'Limabamba', 'Longar'],
      'Utcubamba': ['Bagua Grande', 'Cajaruro', 'Cumba', 'El Milagro', 'Jamalca', 'Lonya Grande']
    },
    'Junin': {
      'Huancayo': ['Huancayo', 'Carhuacallanga', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto'],
      'Concepción': ['Concepción', 'Aco', 'Andamarca', 'Chambará', 'Cochas', 'Comas'],
      'Chanchamayo': ['La Merced', 'Perené', 'Pichanaqui', 'San Luis de Shuaro', 'San Ramón', 'Vitoc'],
      'Jauja': ['Jauja', 'Acolla', 'Apata', 'Ataura', 'Canchayllo', 'Curicaca'],
      'Junín': ['Junín', 'Carhuamayo', 'Ondores', 'Ulcumayo'],
      'Satipo': ['Satipo', 'Coviriali', 'Llaylla', 'Mazamari', 'Pampa Hermosa', 'Pangoa'],
      'Tarma': ['Tarma', 'Acobamba', 'Huaricolca', 'Huasahuasi', 'La Unión', 'Palca'],
      'Yauli': ['La Oroya', 'Chacapalpa', 'Huay-Huay', 'Marcapomacocha', 'Morococha', 'Paccha'],
      'Chupaca': ['Chupaca', 'Ahuac', 'Chongos Bajo', 'Huachac', 'Huamancaca Chico', 'San Juan de Yscos']
    },
    'Lima': {
      'Lima': ['Lima', 'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo'],
      'Barranca': ['Barranca', 'Paramonga', 'Pativilca', 'Supe', 'Supe Puerto'],
      'Cajatambo': ['Cajatambo', 'Copa', 'Gorgor', 'Huancapon', 'Manas'],
      'Canta': ['Canta', 'Arahuay', 'Huamantanga', 'Huaros', 'Lachaqui', 'San Buenaventura'],
      'Cañete': ['San Vicente de Cañete', 'Asia', 'Calango', 'Cerro Azul', 'Chilca', 'Coayllo'],
      'Huaral': ['Huaral', 'Atavillos Alto', 'Atavillos Bajo', 'Aucallama', 'Chancay', 'Ihuarí'],
      'Huarochirí': ['Matucana', 'Antioquia', 'Callahuanca', 'Carampoma', 'Chicla', 'Cuenca'],
      'Huaura': ['Huacho', 'Ambar', 'Caleta de Carquín', 'Checras', 'Hualmay', 'Huaura'],
      'Oyón': ['Oyón', 'Andajes', 'Caujul', 'Cochamarca', 'Navan', 'Pachangara'],
      'Yauyos': ['Yauyos', 'Alis', 'Ayauca', 'Ayaviri', 'Azángaro', 'Cacra']
    }
    // Aquí puedes agregar más regiones según necesites
  };

  constructor(
    private envioService: EnvioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.envio.userId = user.id;
    }
  }


// shipping-form.component.ts

 enviarEnvio(): void {
    // Validar que todos los campos estén llenos
    if ( !this.envio.direccion || !this.envio.region || 
        !this.envio.provincia || !this.envio.localidad || !this.envio.dni || 
        !this.telefonoSinPrefijo) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    // Validar DNI (8 dígitos)
    if (!/^\d{8}$/.test(this.envio.dni)) {
      alert('El DNI debe tener 8 dígitos');
      return;
    }

    // Validar teléfono (9 dígitos)
    if (!/^\d{9}$/.test(this.telefonoSinPrefijo)) {
      alert('El teléfono debe tener 9 dígitos');
      return;
    }

    // Agregar el prefijo +51 al teléfono
    this.envio.telefono = '+51' + this.telefonoSinPrefijo;

    // Guardar temporalmente en localStorage
    localStorage.setItem('envioTemporal', JSON.stringify(this.envio));

    // Redirigir al componente de pago
    this.router.navigate(['/user/pago']);
  }



cargarProvincias(): void {
    this.provincias = [];
    this.localidades = [];
    this.envio.provincia = '';
    this.envio.localidad = '';

    if (this.envio.region && this.datosGeograficos[this.envio.region]) {
      this.provincias = Object.keys(this.datosGeograficos[this.envio.region]);
    }
  }

  cargarLocalidades(): void {
    this.localidades = [];
    this.envio.localidad = '';

    if (this.envio.region && this.envio.provincia && 
        this.datosGeograficos[this.envio.region] && 
        this.datosGeograficos[this.envio.region][this.envio.provincia]) {
      this.localidades = this.datosGeograficos[this.envio.region][this.envio.provincia];
    }
  }

}
 
