import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Paramcoef } from "../models/paramcoef";

@Injectable({
	providedIn: "root",
})
export class DmiServiceService {
	private _ctePosGen: number = 60; //constante de positivite autre que confort
	private _ctePosConf: number = 1; //constante de positivite parametre confort
	private _tauxROM: number = 5; //decide par CMI en %
	private _tauxPayerAbattement: number = 30; //taux à payer pour HP par rapport à VL <=> inverse taux abattement en %
	private _tauxPayerAbattementIndustrie: number = 30; //taux à payer pour Affectation INDUSTRIE par rapport à VL <=> inverse taux abattement en %
	// private _tauxPayerAbattementAutres: number = 85; //AUTRES ABATTEMENT % AJOUTE APRES ALIGNEMENT AVEC H3T
	private _tauxPayerAbattementAutres: number = 100; //AUTRES ABATTEMENT % AJOUTE APRES ALIGNEMENT AVEC H3T
	private _minImpot: number = 2000; //minimum de perception
	private _typeOccupantExistant = {
		"1": "proprietaire",
		"2": "locataire",
		"3": "tiers",
	};
	private _typeAffectationExistant = {
		"1": "service public",
		"2": "usage scolaire",
		"3": "sante",
		"4": "exercice de cultes",
		"5": "habitation",
		"6": "commerce/bureau",
		"7": "artisanat/industrie",
		"9": "autres",
	};
	private _tauxIFPB: Array<number> = [
		//tableau de correspondance entre categorie et valeur locative par metre carre
		5,
		6,
		7,
	];
	private _catValLocatActif: Array<number> = [
		//tableau de correspondance entre categorie et valeur locative par metre carre
		2444,
		2555, 2666, 2777, 2888, 3000, 3200, 3400, 3600, 3800, 4000, 4189, 4378,
		4567, 4756, 4948, 5616, 6284, 6952, 7620, 8290, 8958, 9626, 10294,
		10962, 11630, 14758, 15559, 16361, 17162, 17964, 18766, 19567, 20369,
	];
	private _paramCoefActif: Paramcoef = {
		//ensemble des parametres applicables pour trouver categorie
		couleurMur: 10,
		grille: 13,
		premierPlan: 7,
		accessible: 12,
		puit1: 1,
		chateau: 17,
		quartier: {
			populaire: -14,
			intermediaire: 13,
			industriel: 12,
			residentiel: 22,
			commercial: 10,
		},
		toiture: {
			chaume: -1,
			tuile: -1,
			tole: -1,
			// tole: -2, H3T 
			fibrociment: 9,
			ardoise: 11,
		},
		ossature: {
			confondue: -7,
			cuite: -2,
			// beton: 7, H3T
			beton: 9,//ITY NO VOALOHANY IZAY NOMEN EKIPAN DRF
			metallique: 4,
		},
		mur: {
			bois: -15,
			batue: -10,
			presse: -6,
			cuite: 9,
			parpaing: 15,
			vitre: 9,
			autres: 0
		},
		enduit: {
			pas: -12,
			tany: -10,
			batard: -9,
			jointoyer: 0,
			ciment: 12,
		},
		vitre: {
			sans: -11,
			hazo: 3,
			vy: 9,
			alu: 16,
		},
		lux: {
			garage1: 18,
			cloture: 10,
			jardin1: 17,
			piscine1: 27,
			tennis: 15,
			// pylone1: 15, H3T
			pylone1: 19, //CMI DRF
		},
		confort: {
			elec: 9,
			septique: 15,
			salleEau: 15,
			debaras: 13,
			cuisine: 7,
			// plancherBeton: 7, H3T
			plancherBeton: 5, // DRF CMI
			plancherBois: -1,
			eau1: 14,
		},
	};
	private _finalForm!: string;
	constructor(private snackbar: MatSnackBar) { }
	public openSnackBar($msg: string, $snackBarClass: string) {
		this.snackbar.open($msg, undefined, {
			duration: 2500,
			panelClass: [$snackBarClass],
		});
	}
	public getImpotFinal(ifpb: number, rom: number) {
		let impotFinal = ifpb + rom;
		impotFinal = Math.round(impotFinal);
		impotFinal = Math.max(this.minImpot, impotFinal);

		impotFinal = Math.round(impotFinal / 100);
		impotFinal *= 100;
		return impotFinal;
	}
	public getImpot(
		valeurLocative: number,
		valeurDeclaree: number,
		occupation: number,
		affectation: number,
		ifpbOrRom: number
	) {
		/* ABATTEMENT X 12 X TAUX IFPB si IFPB*/
		/* ABATTEMENT X 12 X TAUX ROM si ROM*/
		let payAbattement: number;
		let impot = 0;
		payAbattement = this.getPayAbattement(
			occupation,
			affectation,
			valeurLocative,
			valeurDeclaree
		);
		if (ifpbOrRom === 0) {
			let tauxIFPB = this.guessIFPBRate(occupation, affectation);
			impot = (payAbattement * 12 * tauxIFPB) / 100;
		} else if (ifpbOrRom === 1) {
			impot = (payAbattement * 12 * this.tauxROM) / 100;
		}
		//impot = min de perception si impot inf a minpercept
		// return Math.max(impot, this.minImpot);
		return impot;
	}
	public getPayAbattement(
		occupation: number,
		affectation: number,
		valeurLocative: number,
		valeurDeclaree: number
	) {
		/*
			HP : Habitation Proprietaire(SI OCCUPANT : PROPRIETAIRE OU AFFECTATION = Artisanat/Industrie)
				30% DE LA VALEUR LOCATIVE MENSUELLE
			Autres :
				Le max entre la VALEUR LOCATIVE MENSUELLE et la VALEUR DECLAREE(hofantrano declarena)
				max(VALEUR LOCATIVE MENSUEL, VALEUR DECLARE)
		*/
		//deviner occupation et affectation
		let ifpbRate = this.guessIFPBRate(occupation, affectation);
		let payAbattement = 0;
		if (
			ifpbRate === this._tauxIFPB[0]
		) {
			//PROPRIETAIRE ET HABITATION = HP
			payAbattement = (valeurLocative * this._tauxPayerAbattement) / 100;
		} else if (this._typeAffectationExistant[
			affectation as unknown as keyof typeof this._typeAffectationExistant
		] === "artisanat/industrie") {
			//AFFECTATION ARTISANAT/INDUSTRIE
			payAbattement = Math.max((valeurLocative * this._tauxPayerAbattementIndustrie) / 100, valeurDeclaree);
		} else {
			payAbattement = Math.max((valeurLocative * this.tauxPayerAbattementAutres) / 100, valeurDeclaree);
			//AUTRES ABATTEMENT 15% AJOUTE APRES ALIGNEMENT AVEC H3T
			// payAbattement = payAbattement*this.tauxPayerAbattementAutres/100;
			// console.log("paiement avec abattement autres: "+payAbattement);

		} //PROPRIETAIRE ET HABITATION
		return payAbattement;
	}
	public guessIFPBRate(occupation: number, affectation: number) {
		/*
		5% : si OCCUPANT : PROPRIETAIRE et AFFECTATION : HABITATION
		6% : si OCCUPANT : PROPRIETAIRE et AFFECTATION : AUTRES
		7% : si OCCUPANT : TIERS(LOCATAIRE OU TIERS) et AFFECTATION : -- (N IMPORTE)
		*/
		if (
			this._typeOccupantExistant[
			occupation as unknown as keyof typeof this._typeOccupantExistant
			] === "proprietaire"
		) {
			if (
				this._typeAffectationExistant[
				affectation as unknown as keyof typeof this._typeAffectationExistant
				] === "habitation"
			) {
				return this._tauxIFPB[0];
			} else {
				return this._tauxIFPB[1];
			}
		} else {
			return this._tauxIFPB[2];
		}
	}
	public calculVLMensuelle(categorie: number, superficie: number) {
		let vlUnit = this.getVLUnitaire(categorie) as number;
		return vlUnit * superficie;
	}
	public getVLUnitaire(categorie: number) {
		// valeur locative par metre carre correspondante a la categorie donnee
		let vlUnitaire = 0;
		try {
			vlUnitaire = this._catValLocatActif[categorie];
		} catch (error) {
			//si categorie non repertoriee dans la table de correspondance categorie-vlUnitaire
			return console.error();
		}
		return vlUnitaire;
	}
	public getCategorie(coefSumExistant: number) {
		// catégorie = PARTIE ENTIERE DE "somme des coefficients existants divisée par 10"
		//ra categorie mihoatra ny max d n max n avoaka
		return Math.min(
			this.catValLocatActif.length - 1,
			Math.floor(coefSumExistant / 10)
		);
	}
	public getSumCoefExistant(
		paramCoefExistant: Paramcoef,
		withConst: boolean
	) {
		/*
			paramCoefExistant : multiplicateur no ao, zay 0 tsisy, zay 1 misy
			confrontena paramCoefExistant si _paramCoefActif : multipliena isaky n field
			apetaka ao n valeurny
			sommena jiaby
			ajoutena cte de postivite general/confort
		*/
		let sumCoef = 0;
		let i = 0;
		for (let paramName in this.paramCoefActif) {
			// let keyValueCoefExistant = Object.entries(paramCoefExistant);
			let valeurCoef = this.paramCoefActif[paramName as keyof Paramcoef];
			let valeurCoefExistant =
				paramCoefExistant[paramName as keyof Paramcoef];
			if (typeof valeurCoef === "object" && typeof valeurCoef !== null) {
				let keyValueCoefExistantImb =
					Object.entries(valeurCoefExistant);

				let j = 0;
				for (let valeurCoefImb of Object.values(valeurCoef)) {
					sumCoef += (valeurCoefImb *
						keyValueCoefExistantImb[j][1]) as number;
					j++;
				}
			} else if (typeof valeurCoefExistant === "number") {
				sumCoef += ((valeurCoef as number) *
					valeurCoefExistant) as number;
			}
			i++;
		}
		if (withConst) {
			sumCoef += this._ctePosGen + this._ctePosConf;
		}
		return sumCoef;
	}

	set finalForm(finalForm: string) {
		this._finalForm = finalForm;
	}
	get finalForm(): string {
		return this._finalForm;
	}
	get typeAffectationExistant(): object {
		return this._typeAffectationExistant;
	}
	get typeOccupantExistant(): object {
		return this._typeOccupantExistant;
	}
	get tauxIFPB(): Array<number> {
		return this._tauxIFPB;
	}
	get catValLocatActif(): Array<number> {
		return this._catValLocatActif;
	}

	get minImpot(): number {
		return this._minImpot;
	}
	get tauxPayerAbattement(): number {
		return this._tauxPayerAbattement;
	}
	get tauxPayerAbattementIndustrie(): number {
		return this._tauxPayerAbattementIndustrie;
	}
	get tauxPayerAbattementAutres(): number {
		return this._tauxPayerAbattementAutres;
	}
	get tauxROM(): number {
		return this._tauxROM;
	}
	get ctePosGen(): number {
		return this._ctePosGen;
	}
	get ctePosConf(): number {
		return this._ctePosConf;
	}
	get paramCoefActif(): Paramcoef {
		return this._paramCoefActif;
	}
}
