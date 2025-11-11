// models/comprobante.model.ts
export interface ComprobanteRequest {
  ventaId: number;
  tipoComprobante: number;
  numeroForzado: number;
  clienteDNI: string;
  clienteNombres: string;
  clienteApellidos: string;
  ruc: string;
  razonSocial: string;
}


// models/comprobante.model.ts - Modelo actualizado basado en tu respuesta real
export interface ComprobanteResponse {
  ok: boolean;
  serie?: string;
  numero?: number;
  enlace_pdf?: string;
  respuesta_nubefact?: {
    tipo_de_comprobante: number;
    serie: string;
    numero: number;
    enlace: string;
    aceptada_por_sunat: boolean;
    sunat_description?: string;
    sunat_note?: string;
    sunat_responsecode?: string;
    sunat_soap_error: string;
    anulado: boolean;
    pdf_zip_base64?: string;
    xml_zip_base64?: string;
    cdr_zip_base64?: string;
    cadena_para_codigo_qr: string;
    codigo_hash: string;
    codigo_de_barras: string;
    key: string;
    digest_value: string;
    enlace_del_pdf: string;
    enlace_del_xml: string;
    enlace_del_cdr?: string;
    invoice?: {
      tipo_de_comprobante: number;
      serie: string;
      numero: number;
      enlace: string;
      aceptada_por_sunat: boolean;
      sunat_description?: string;
      sunat_note?: string;
      sunat_responsecode?: string;
      sunat_soap_error: string;
      pdf_zip_base64?: string;
      xml_zip_base64?: string;
      cdr_zip_base64?: string;
      cadena_para_codigo_qr: string;
      codigo_hash: string;
      digest_value: string;
      codigo_de_barras: string;
      key: string;
    };
  };
}
