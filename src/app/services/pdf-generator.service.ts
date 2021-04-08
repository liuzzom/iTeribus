import { Injectable } from '@angular/core';
import {PDFDocument, PDFForm} from "pdf-lib";
import {HttpClient} from "@angular/common/http";
import {saveAs} from 'file-saver';
import {User} from "../../domain-model/User";
import {Movement} from "../../domain-model/Movement";

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  formFields = [];
  private form: PDFForm;
  private pdfDoc: PDFDocument;

  constructor(
    private httpClient: HttpClient
  ) { }

  async loadForm(){

    // Form Url and get it as byte buffer
    const formUrl = 'assets/modello_vuoto.pdf';
    const formPdfBytes = await this.httpClient.get(formUrl, {responseType: "arraybuffer"}).toPromise();

    // Load a PDF with form fields
    this.pdfDoc = await PDFDocument.load(formPdfBytes);

    // Get the form containing all the fields
    this.form = this.pdfDoc.getForm();

    // Initialize the fields array
    const fields = this.form.getFields()
    fields.forEach(field => {
      const type = field.constructor.name
      const name = field.getName()
      this.formFields.push({type: type, name: name});
    });

    console.log(this.formFields);
  }

  private prettifyDocument(documentType: string): string{
    switch (documentType){
      case 'cartaIdentità':
        return 'Carta d\'Identità';
      case 'patenteDiGuida':
        return 'Patente di Guida';
      case 'passaporto':
        return 'Passaporto';
      default:
        return 'Error';
    }
  }

  private getReason(reasonCode: number): string {
    switch (reasonCode){
      case 6:
        return "Scelta1";
      case 0:
        return "Scelta2";
      default:
        return "Scelta3";
    }
  }

  private generateOtherReasonMessage(reasonCode: number): string{
    switch (reasonCode){
      case 2:
        return 'Rientro nel luogo di residenza/domicilio'
      case 3:
        return 'Acquisto di beni di prima necessità'
      case 4:
        return 'Motivi legati allo studio'
      case 5:
        return 'Visita/assistenza ad un parente/congiunto'
      default:
        return '';
    }
  }

  async fillForm(user: User, movement: Movement){
    console.log(user);
    console.log(movement);

    await this.loadForm();

    // ----- Get all the form fields ----- \\
    // User Info
    const undersignedField = this.form.getTextField('Il sottoscritto');

    const birthDayField = this.form.getTextField('nato giorno');
    const birthMonthField = this.form.getTextField('nato mese');
    const birthYearField = this.form.getTextField('nato anno');
    const birthPlaceField = this.form.getTextField('luogo di nascita');
    const birthProvinceField = this.form.getTextField('provincia di nascita');

    const residentField = this.form.getTextField('residente in');
    const residentStreetField = this.form.getTextField('via residenza');
    const residentProvinceField = this.form.getTextField('provincia residenza');

    const domiciledField = this.form.getTextField('e domiciliato in');
    const domiciledProvinceField = this.form.getTextField('provincia domicilio');
    const domiciledStreetField = this.form.getTextField('via domicilio');

    const documentTypeField = this.form.getTextField('identificato a mezzo');
    const documentNumberField = this.form.getTextField('nr');
    const documentReleasedByField = this.form.getTextField('rilasciato da');
    const documentDayField = this.form.getTextField('giorno documento');
    const documentMonthField = this.form.getTextField('mese documento');
    const documentYearField = this.form.getTextField('anno documento');

    const dateAndPlaceField = this.form.getTextField('data, ora e luogo');

    const phoneNumberField = this.form.getTextField('utenza telefonica');

    // Movement Info
    const reasonField = this.form.getTextField('Testo1');
    const tripStartPointField = this.form.getTextField('Testo2');
    const tripEndPointField = this.form.getTextField('Testo3');
    const declarationsField = this.form.getTextField('Testo4');
    const reasonsRadioGroup = this.form.getRadioGroup('Group7');

    // console.log(reasonsRadioGroup.getOptions()); ["Scelta1", "Scelta2", "Scelta3"]

    // set all the fields
    undersignedField.setText(`\t${user.name} ${user.surname}`);

    const birthDate = user.dateOfBirth.toString().split('-')
    birthDayField.setText(birthDate[2].split('T')[0]);
    birthMonthField.setText(birthDate[1]);
    birthYearField.setText(birthDate[0]);
    birthPlaceField.setText(user.birthPlace.municipality);
    birthProvinceField.setText(user.birthPlace.province);

    residentField.setText(user.residence.municipality);
    residentProvinceField.setText(user.residence.province);
    residentStreetField.setText(user.residence.address);

    domiciledField.setText(user.domicile.municipality);
    domiciledProvinceField.setText(user.domicile.province);
    domiciledStreetField.setText(user.domicile.address);

    documentTypeField.setText(this.prettifyDocument(user.document.type));
    documentNumberField.setText(user.document.number.toUpperCase());
    documentReleasedByField.setText(user.document.issuingAuthority);

    const documentReleaseDate = user.document.issueDate.toString().split('-');
    documentDayField.setText(documentReleaseDate[2].split('T')[0]);
    documentMonthField.setText(documentReleaseDate[1]);
    documentYearField.setText(documentReleaseDate[0]);

    phoneNumberField.setText(user.phoneNumber);

    let otherReasonMessage: string = this.generateOtherReasonMessage(movement.reason);
    if(otherReasonMessage){
      reasonField.setText(otherReasonMessage);
    }else {
      reasonField.setText(movement.otherReasonMessage);
    }

    tripStartPointField.setText(movement.departure);
    tripEndPointField.setText(movement.destination);
    declarationsField.setText(movement.notes);
    dateAndPlaceField.setText('TO DO'); // TODO: gestire il caso di generazione con o senza data
    reasonsRadioGroup.select(this.getReason(movement.reason));

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await this.pdfDoc.save();

    // Trigger the browser to download the PDF document
    const file = new Blob([pdfBytes], {type: 'application/pdf'});
    saveAs(file, `${movement.name}.pdf`);
  }
}
