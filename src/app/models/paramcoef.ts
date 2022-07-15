export interface Paramcoef {
	couleurMur : number,
	grille : number,
	premierPlan : number,
	accessible : number,
	puit1 : number,
	chateau : number,
	quartier : {
		populaire : number;
		intermediaire : number;
		industriel : number;
		residentiel : number;
		commercial : number;
	},
	toiture : {
		chaume : number;
		tuile : number;
		tole : number;
		fibrociment : number;
		ardoise : number;
	},
	ossature : {
		confondue : number;
		cuite : number;
		beton : number;
		metallique : number;
	},
	mur : {
		bois : number;
		batue : number;
		presse : number;
		cuite : number;
		parpaing : number;
		vitre : number;
		autres: number;
	},
	enduit : {
		pas : number;
		tany : number;
		batard : number;
		jointoyer : number;
		ciment : number;
	},
	vitre : {
		sans : number;
		hazo : number;
		vy : number;
		alu : number;
	},
	lux : {
		garage1 : number;
		cloture : number;
		jardin1 : number;
		piscine1 : number;
		tennis : number;
		pylone1 : number;
	},
	confort : {
		elec : number;
		septique : number;
		salleEau : number;
		debaras : number;
		cuisine : number;
		plancherBeton : number;
		plancherBois : number;
		eau1 : number;
	}
}
