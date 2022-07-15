import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Paramcoef } from "../models/paramcoef";
import { DmiServiceService } from "../services/dmi-service.service";
import { TaxAmountDialogComponent } from "../tax-amount-dialog/tax-amount-dialog.component";
import { MatTooltip, TooltipComponent } from "@angular/material/tooltip";

@Component({
	selector: "app-ficheifpb",
	templateUrl: "./ficheifpb.component.html",
	styleUrls: ["./ficheifpb.component.scss"],
})
export class FicheifpbComponent implements OnInit {
	disabledSubmitBtn = false;
	indiceAlert = 0;
	locataire = false;
	nowYear: number = new Date().getFullYear() - 10;
	ctePosGen!: number;
	ctePosConfort!: number;
	tauxROMActif!: number;
	sumCoefExistant!: number;
	paramCoefActif!: Paramcoef;
	typeOccupantActif!: object;
	typeAffectationActif!: object;
	loyerInput = 0; //valeur declaree - loyer
	couleurMurInput = 0;
	ossatureInput = 0;
	grilleInput = 0;
	accessibleInput = 0;
	premierPlanInput = 0;
	puit1Input = 0;
	chateauInput = 0;
	garage1Input = 0;

	clotureInput = 0;
	jardin1Input = 0;
	piscine1Input = 0;
	tennisInput = 0;
	pylone1Input = 0;

	surfaceInput = 0;
	typeOccupantInput = 1; //occupation choisie
	typeAffectationInput = 5; //affectation choisi
	paramCoefInput!: Paramcoef;
	taxe: number = 0;
	valeurLocative: number = 0;
	taxeRom: number = 0;
	taxeIfpb: number = 0;
	defaultForm = this.formBuilder.group({
		typeOccupantInput: "1",
		loyerInput: [{ value: "0", disabled: true }],
		surfaceInput: ["1", Validators.min(1)],
		cuisine: false,
		septique: false,
		eau1: false,
		plancherBois: false,
		salleEau: false,
		debaras: false,
		elec: false,
		plancherBeton: false,
		typeAffectationInput: "5",
		nivOcc: [0, Validators.min(0)],
	});
	pcnivForm = this.formBuilder.group({
		immeubleSisForm: this.formBuilder.group({
			quartierInput: "populaire",
		}), //detail sur l emplacement de l immeuble

		caractImmeubleForm: this.formBuilder.group({
			ossatureInput: "",
			murInput: "",
			enduitInput: "",
			vitreInput: "",
			couleurMurInput: "",
			grilleInput: "",
			toitureInput: "",
			accessibleInput: "",
			premierPlanInput: "",
			puit1Input: "",
			chateauInput: "",
			garage1Input: "",
			clotureInput: "",
			jardin1Input: "",
			piscine1Input: "",
			tennisInput: "",
			pylone1Input: "",
			nbFloorInput: ["", Validators.min(0)],
		}), //detail sur le papier de l immeuble

		elements: this.formBuilder.array([this.defaultForm]),
	});

	constructor(
		private formBuilder: FormBuilder,
		private dmiService: DmiServiceService,
		private matDialog: MatDialog
	) {
		this.initForm();

		this.ctePosGen = this.dmiService.ctePosGen;
		this.ctePosConfort = this.dmiService.ctePosConf;
		this.paramCoefActif = this.dmiService.paramCoefActif;
		this.typeOccupantActif = this.dmiService.typeOccupantExistant;
		this.typeAffectationActif = this.dmiService.typeAffectationExistant;
		this.tauxROMActif = this.dmiService.tauxROM;
		
	}

	ngOnInit(): void {
		
	}
	ngOnChanges(changes: SimpleChanges) : void {
		// logique du composant
		// console.log("fdsqfqsd0"+
		// 	document.getElementById("alert"));
	}
	onGlobalChange(){
		//DESACTIVATION BOUTON 
		// if ( document.getElementById("alert")!==null ) {
		// 	this.disabledSubmitBtn = true;
		// }else{
		// 	this.disabledSubmitBtn = false;
		// }
		// console.log(
		// 	document.getElementById("alert"));
	}
	onChangeLoyerInput(indice: number) {
		if (this.elements.at(indice)!.get("loyerInput")!.value > 0) {
			this.locataire = false;
		} else {
			this.indiceAlert = indice;
			this.locataire = true;
		}
	}
	onChangeOccupant(indice: number) {
		let occupantInput: number = Number(
			this.elements.at(indice)!.get("typeOccupantInput")!.value
		);
		let occupantLocataire: number = Number(
			Object.keys(this.dmiService.typeOccupantExistant)[1]
		);
		if (occupantInput === occupantLocataire) {
			this.indiceAlert = indice;
			this.locataire = true;
			let enabledLoyerInputControl = this.elements
				.at(indice)!
				.get("loyerInput")!
				.enable();
			// this.tooltip.show();
			///
			this.dmiService.openSnackBar(
				"Hamarino ny hofan-trano",
				"snackbarPanelStyleWarn"
			);
			if (this.elements.at(indice)!.get("loyerInput")!.value > 0) {
				this.locataire = false;
			} else {
				this.locataire = true;
			}
		} else {
			this.locataire = false;
			this.elements.at(indice)!.get("loyerInput")!.patchValue(0);
			let disabledLoyerInputControl = this.elements
				.at(indice)!
				.get("loyerInput")!
				.disable();
		}
	}
	openTaxAmountDialog(taxAmount: number) {
		const dialogRef = this.matDialog.open(TaxAmountDialogComponent, {
			data: { taxAmount: taxAmount },
		});
	}
	onSubmitForm() {
		/* REINIT VALEUR CALCUL */
		this.valeurLocative = 0;
		this.taxeIfpb = 0;
		this.taxeRom = 0;
		this.taxe = 0;
		/* */

		let emplacementImmeuble = this.pcnivForm.controls[
			"immeubleSisForm"
		] as FormGroup;
		

		let caractImmeuble = this.pcnivForm.controls[
			"caractImmeubleForm"
		] as FormGroup;

		////
		let paramCoefInput: Paramcoef = {
			//ensemble des parametres d'une piece/niveau enquetee (GEN+0-a) : sois 0 sois 1
			couleurMur: 0,
			grille: 0,
			premierPlan: 0,
			accessible: 0,
			puit1: 0,
			chateau: 0,
			quartier: {
				populaire: 1,
				intermediaire: 0,
				industriel: 0,
				residentiel: 0,
				commercial: 0,
			},
			toiture: {
				chaume: 1,
				tuile: 0,
				tole: 0,
				fibrociment: 0,
				ardoise: 0,
			},
			ossature: {
				confondue: 1,
				cuite: 0,
				beton: 0,
				metallique: 0,
			},
			mur: {
				bois: 1,
				batue: 0,
				presse: 0,
				cuite: 0,
				parpaing: 0,
				vitre: 0,
				autres: 0
			},
			enduit: {
				pas: 1,
				tany: 0,
				batard: 0,
				jointoyer: 0,
				ciment: 0,
			},
			vitre: {
				sans: 1,
				hazo: 0,
				vy: 0,
				alu: 0,
			},
			lux: {
				garage1: 0,
				cloture: 0,
				jardin1: 0,
				piscine1: 0,
				tennis: 0,
				pylone1: 0,
			},
			confort: {
				elec: 0,
				septique: 0,
				salleEau: 0,
				debaras: 0,
				cuisine: 0,
				plancherBeton: 0,
				plancherBois: 0,
				eau1: 0,
			},
		};
		// quartier
		let valeurQuartier = emplacementImmeuble.get("quartierInput")?.value;
		let paramQuartier = <any>{};
		for (const iterator of Object.entries(this.paramCoefActif.quartier)) {
			let keyy: string = iterator[0];
			paramQuartier[keyy as string as keyof object] = 0;
			if (keyy === valeurQuartier) {
				paramQuartier[keyy as string as keyof object] = 1;
			}
		}
		paramCoefInput.quartier = paramQuartier;
		///
		//caracteristique
		let nbFloorInput = caractImmeuble.get("nbFloorInput")?.value; //nombre etages tsy hanaovana calcul
		// paramCoefInput.caractImmeuble

		// this.paramCoefActif.
		let valeurOssature = caractImmeuble.get("ossatureInput")?.value;
		let paramOssature = <any>{};
		for (const iterator of Object.entries(this.paramCoefActif.ossature)) {
			let keyy: string = iterator[0];
			paramOssature[keyy as string as keyof object] = 0;
			if (keyy === valeurOssature) {
				paramOssature[keyy as string as keyof object] = 1;
			}
		}
		paramCoefInput.ossature = paramOssature;
		let valeurMur = caractImmeuble.get("murInput")?.value;
		let paramMur = <any>{};
		for (const iterator of Object.entries(this.paramCoefActif.mur)) {
			let keyy: string = iterator[0];
			paramMur[keyy as string as keyof object] = 0;
			if (keyy === valeurMur) {
				paramMur[keyy as string as keyof object] = 1;
			}
		}
		paramCoefInput.mur = paramMur;
		let valeurEnduit = caractImmeuble.get("enduitInput")?.value;
		let paramEnduit = <any>{};
		for (const iterator of Object.entries(this.paramCoefActif.enduit)) {
			let keyy: string = iterator[0];
			paramEnduit[keyy as string as keyof object] = 0;
			if (keyy === valeurEnduit) {
				paramEnduit[keyy as string as keyof object] = 1;
			}
		}
		paramCoefInput.enduit = paramEnduit;
		let valeurVitre = caractImmeuble.get("vitreInput")?.value;
		let paramVitre = <any>{};
		for (const iterator of Object.entries(this.paramCoefActif.vitre)) {
			let keyy: string = iterator[0];
			paramVitre[keyy as string as keyof object] = 0;
			if (keyy === valeurVitre) {
				paramVitre[keyy as string as keyof object] = 1;
			}
		}
		paramCoefInput.vitre = paramVitre;
		let valeurToiture = caractImmeuble.get("toitureInput")?.value;
		let paramToiture = <any>{};
		for (const iterator of Object.entries(this.paramCoefActif.toiture)) {
			let keyy: string = iterator[0];
			paramToiture[keyy as string as keyof object] = 0;
			if (keyy === valeurToiture) {
				paramToiture[keyy as string as keyof object] = 1;
			}
		}
		paramCoefInput.toiture = paramToiture;
		///
		this.couleurMurInput = 0;
		if (String(caractImmeuble.get("couleurMurInput")?.value) == "true") {
			this.couleurMurInput = 1;
		} //0 ou 1
		paramCoefInput.couleurMur = this.couleurMurInput;

		this.grilleInput = 0;
		if (String(caractImmeuble.get("grilleInput")?.value) == "true") {
			this.grilleInput = 1;
		} //0 ou 1
		paramCoefInput.grille = this.grilleInput;

		this.accessibleInput = 0;
		if (String(caractImmeuble.get("accessibleInput")?.value) == "true") {
			this.accessibleInput = 1;
		} //0 ou 1
		paramCoefInput.accessible = this.accessibleInput;

		this.premierPlanInput = 0;
		if (String(caractImmeuble.get("premierPlanInput")?.value) == "true") {
			this.premierPlanInput = 1;
		} //0 ou 1
		paramCoefInput.premierPlan = this.premierPlanInput;

		this.puit1Input = 0;
		if (String(caractImmeuble.get("puit1Input")?.value) == "true") {
			this.puit1Input = 1;
		} //0 ou 1
		paramCoefInput.puit1 = this.puit1Input;

		this.chateauInput = 0;
		if (String(caractImmeuble.get("chateauInput")?.value) == "true") {
			this.chateauInput = 1;
		} //0 ou 1
		paramCoefInput.chateau = this.chateauInput;

		//lux objet ray mits HAFA KELY CONSTITUENA TSRAIRAY
		this.garage1Input = 0;
		if (String(caractImmeuble.get("garage1Input")?.value) == "true") {
			this.garage1Input = 1;
		} //0 ou 1
		paramCoefInput.lux.garage1 = this.garage1Input;

		this.clotureInput = 0;
		if (String(caractImmeuble.get("clotureInput")?.value) == "true") {
			this.clotureInput = 1;
		} //0 ou 1
		paramCoefInput.lux.cloture = this.clotureInput;

		this.jardin1Input = 0;
		if (String(caractImmeuble.get("jardin1Input")?.value) == "true") {
			this.jardin1Input = 1;
		} //0 ou 1
		paramCoefInput.lux.jardin1 = this.jardin1Input;

		this.piscine1Input = 0;
		if (String(caractImmeuble.get("piscine1Input")?.value) == "true") {
			this.piscine1Input = 1;
		} //0 ou 1
		paramCoefInput.lux.piscine1 = this.piscine1Input;

		this.tennisInput = 0;
		if (String(caractImmeuble.get("tennisInput")?.value) == "true") {
			this.tennisInput = 1;
		} //0 ou 1
		paramCoefInput.lux.tennis = this.tennisInput;

		this.pylone1Input = 0;
		if (String(caractImmeuble.get("pylone1Input")?.value) == "true") {
			this.pylone1Input = 1;
		} //0 ou 1
		paramCoefInput.lux.pylone1 = this.pylone1Input;

		///paramcoefgeneral mbola tsis confort
		let paramCoefGeneral = JSON.parse(JSON.stringify(paramCoefInput));
		let sumCoefGeneral =
			this.dmiService.getSumCoefExistant(paramCoefGeneral, false) +
			this.ctePosGen; //avec constante de positivite general mais pas confort
		let impotIFPB = 0;
		let impotROM = 0;
		////////////loop confort
		for (const fg of this.elements.controls) {
			let elec = 0;
			if (String(fg.get("elec")?.value) == "true") {
				elec = 1;
			} //0 ou 1

			let cuisine = 0;
			if (String(fg.get("cuisine")?.value) == "true") {
				cuisine = 1;
			} //0 ou 1
			let septique = 0;
			if (String(fg.get("septique")?.value) == "true") {
				septique = 1;
			} //0 ou 1
			let salleEau = 0;
			if (String(fg.get("salleEau")?.value) == "true") {
				salleEau = 1;
			} //0 ou 1
			let debaras = 0;
			if (String(fg.get("debaras")?.value) == "true") {
				debaras = 1;
			} //0 ou 1
			let plancherBeton = 0;
			if (String(fg.get("plancherBeton")?.value) == "true") {
				plancherBeton = 1;
			} //0 ou 1
			let plancherBois = 0;
			if (String(fg.get("plancherBois")?.value) == "true") {
				plancherBois = 1;
			} //0 ou 1
			let eau1 = 0;
			if (String(fg.get("eau1")?.value) == "true") {
				eau1 = 1;
			} //0 ou 1

			// eau1: 1,
			let confortPc: Paramcoef = {
				//ts raisina n param general f atao 0 jiab, ny confort ihany n asiana valeur
				couleurMur: 0,
				grille: 0,
				premierPlan: 0,
				accessible: 0,
				puit1: 0,
				chateau: 0,
				quartier: {
					populaire: 0,
					intermediaire: 0,
					industriel: 0,
					residentiel: 0,
					commercial: 0,
				},
				toiture: {
					chaume: 0,
					tuile: 0,
					tole: 0,
					fibrociment: 0,
					ardoise: 0,
				},
				ossature: {
					confondue: 0,
					cuite: 0,
					beton: 0,
					metallique: 0,
				},
				mur: {
					bois: 0,
					batue: 0,
					presse: 0,
					cuite: 0,
					parpaing: 0,
					vitre: 0,
					autres: 0
				},
				enduit: {
					pas: 0,
					tany: 0,
					batard: 0,
					jointoyer: 0,
					ciment: 0,
				},
				vitre: {
					sans: 0,
					hazo: 0,
					vy: 0,
					alu: 0,
				},
				lux: {
					garage1: 0,
					cloture: 0,
					jardin1: 0,
					piscine1: 0,
					tennis: 0,
					pylone1: 0,
				},
				confort: {
					elec: elec,
					septique: septique,
					salleEau: salleEau,
					debaras: debaras,
					cuisine: cuisine,
					plancherBeton: plancherBeton,
					plancherBois: plancherBois,
					eau1: eau1,
				},
			};
			paramCoefInput.confort = confortPc.confort;

			let affectationPc = fg.get("typeAffectationInput")?.value;
			let occupantPc = fg.get("typeOccupantInput")?.value;
			let loyerPc = fg.get("loyerInput")?.value;
			let surfPc = fg.get("surfaceInput")?.value;
			let nivOcc = fg.get("nivOcc")?.value;

			let sumCoefPcConfort =
				this.dmiService.getSumCoefExistant(confortPc, false) +
				this.ctePosConfort; //avec constante de positivite confort mais pas general

			let catPcNiv = this.dmiService.getCategorie(
				sumCoefGeneral + sumCoefPcConfort
			); //isaky ny fiche 5-zavatra

			let vlMensuelle = this.dmiService.calculVLMensuelle(
				catPcNiv,
				surfPc
			);
			
			let payAbatt = this.dmiService.getPayAbattement(
				occupantPc,
				affectationPc,
				vlMensuelle,
				loyerPc
			)!;
			// getImpot(valeurLocative: number, valeurDeclaree: number, occupation: number, affectation: number, ifpbOrRom: number)
			impotIFPB += this.dmiService.getImpot(
				vlMensuelle,
				loyerPc,
				occupantPc,
				affectationPc,
				0
			);
			impotROM += this.dmiService.getImpot(
				vlMensuelle,
				loyerPc,
				occupantPc,
				affectationPc,
				1
			);

			this.valeurLocative += vlMensuelle; //VALEUR LOCATIVE TOTALE DE LA MAISON
		}
		let impotFinal = this.dmiService.getImpotFinal(impotIFPB, impotROM);
		this.taxeRom = impotROM;
		this.taxeRom = Math.round(this.taxeRom / 10);
		this.taxeRom *= 10;
		this.taxeIfpb = impotIFPB;
		this.taxeIfpb = Math.round(this.taxeIfpb / 10);
		this.taxeIfpb *= 10;
		this.taxe = impotFinal;
		/* personnalisation : affichage composant dialogue */
		// let dialogTaxAmount = dialo
		this.openTaxAmountDialog(impotFinal);
		// let all = this.elements.controls
		/* STOCKAGE LOCALSTORAGE */
		let finalForm = this.formBuilder.group({
			immeubleSisForm: emplacementImmeuble, //detail sur l emplacement de l immeuble
			caractImmeubleForm: caractImmeuble, //detail sur le papier de l immeuble
			elements: this.elements,
		});
		// 

		//////
		this.dmiService.finalForm = JSON.stringify(finalForm.value);
		
	}
	initForm() {
		let savedFormStr = localStorage.getItem("savedForm");
		if (savedFormStr !== null) {
			let savedForm = JSON.parse(savedFormStr); //objet JSON - formGroup PCNiv TS
			
			let elementsConfObj = savedForm.elements; //tableau d'objets JSON - formArray elements TS
			
			let confFormGroupArr: Array<FormGroup> = []; //tableau d formgroup - hatao anatin builder.array
			let indice = 0;
			for (const elementConf of elementsConfObj) {
				let firstElement = elementConf; //elementConf objet JSON - formgroup TS
				
				let typeOccupantRestore = elementConf.typeOccupantInput; //attribut JSON - formcontrol TS
				
				let loyerRestore = elementConf.loyerInput; //attribut JSON - formcontrol TS
				

				let surfaceRestore = elementConf.surfaceInput; //attribut JSON - formcontrol TS
				

				let cuisineRestore = elementConf.cuisine; //attribut JSON - formcontrol TS
				

				let septiqueRestore = elementConf.septique; //attribut JSON - formcontrol TS
				

				let eau1Restore = elementConf.eau1; //attribut JSON - formcontrol TS
				

				let plancherBoisRestore = elementConf.plancherBois; //attribut JSON - formcontrol TS
				

				let salleEauRestore = elementConf.salleEau; //attribut JSON - formcontrol TS
				

				let debarasRestore = elementConf.debaras; //attribut JSON - formcontrol TS
				

				let elecRestore = elementConf.elec; //attribut JSON - formcontrol TS
				
				let plancherBetonRestore = elementConf.plancherBeton; //attribut JSON - formcontrol TS
				
				let typeAffectationRestore = elementConf.typeAffectationInput; //attribut JSON - formcontrol TS
				let nivOcc = elementConf.nivOcc; //attribut JSON - formcontrol TS
				
				/* */
				let occupantInput: number = Number(typeOccupantRestore);
				// console.log(typeof(occupantInput));
				let occupantLocataire: number = Number(
					Object.keys(this.dmiService.typeOccupantExistant)[1]
				);
				// console.log('occupantLocataire: '+typeof(occupantLocataire) );

				let loyerInputRestore = [{ value: 0, disabled: true }];	
				if (occupantInput === occupantLocataire) {
					loyerInputRestore = [{ value: loyerRestore, disabled: false }];	
					// this.dmiService.openSnackBar(
					// 	"Ampidiro ny hofan-trano",
					// 	"snackbarPanelStyleWarn"
					// );
				} 
				/* */
				let confortRestore = this.formBuilder.group({
					typeOccupantInput: typeOccupantRestore,
					loyerInput: loyerInputRestore,
					surfaceInput: [surfaceRestore, Validators.min(1)],
					cuisine: cuisineRestore,
					septique: septiqueRestore,
					eau1: eau1Restore,
					plancherBois: plancherBoisRestore,
					salleEau: salleEauRestore,
					debaras: debarasRestore,
					elec: elecRestore,
					plancherBeton: plancherBetonRestore,
					typeAffectationInput: typeAffectationRestore,
					nivOcc: [nivOcc, Validators.min(0)],
				});
				confFormGroupArr.push(confortRestore);
				indice++;
			}
			let savedFormGroup: FormGroup = this.formBuilder.group({
				immeubleSisForm: this.formBuilder.group(
					savedForm.immeubleSisForm
				), //detail sur l emplacement de l immeuble
				caractImmeubleForm: this.formBuilder.group(
					savedForm.caractImmeubleForm
				), //detail sur caracteristique de l immeuble
				elements: this.formBuilder.array(confFormGroupArr),
			});
			let formArrayConf: FormArray = savedFormGroup.get(
				"elements"
			)! as FormArray;
			for (const formGroupObj of formArrayConf.controls) {
				
			}
			
			

			this.pcnivForm = savedFormGroup;
		} else {	
			let caractImm = this.formBuilder.group({
				ossatureInput: "confondue",
				murInput: "bois",
				enduitInput: "pas",
				vitreInput: "hazo",
				couleurMurInput: false,
				grilleInput: false,
				toitureInput: "chaume",
				accessibleInput: false,
				premierPlanInput: false,
				puit1Input: false,
				chateauInput: false,
				garage1Input: false,
				clotureInput: false,
				jardin1Input: false,
				piscine1Input: false,
				tennisInput: false,
				pylone1Input: false,
				nbFloorInput: [0, Validators.min(0)],
			}); //detail sur le papier de l immeuble
		

			let elementsFormArr = this.formBuilder.array([this.defaultForm]);

			this.pcnivForm = this.formBuilder.group({
				immeubleSisForm: this.formBuilder.group({
					quartierInput: "populaire",
				}), //detail sur l emplacement de l immeuble
				caractImmeubleForm: caractImm, //detail sur le papier de l immeuble
				elements: elementsFormArr,
			});
		}
	}
	onAddNewForm() {
		let newForm: FormGroup = this.formBuilder.group({
			typeOccupantInput: "1",
			loyerInput: [{ value: "0", disabled: true }],
			surfaceInput: ["1", Validators.min(1)],
			cuisine: false,
			septique: false,
			eau1: false,
			plancherBois: false,
			salleEau: false,
			debaras: false,
			elec: false,
			plancherBeton: false,
			typeAffectationInput: "5",
			nivOcc: [0, Validators.min(0)],
		});
		this.elements.push(newForm);
		this.dmiService.openSnackBar(
			"Niampy efajoro iray",
			"snackbarPanelStyle"
		);
	}
	onDelForm(formIndex: number) {
		this.elements.removeAt(formIndex);
		this.dmiService.openSnackBar(
			"Niala efajoro iray",
			"snackbarPanelStyleWarn"
		);
	}
	get elements() {
		return this.pcnivForm.controls["elements"] as FormArray;
	}
}
