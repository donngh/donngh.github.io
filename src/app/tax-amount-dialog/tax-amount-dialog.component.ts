import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DmiServiceService } from '../services/dmi-service.service';
import { ShowTempMsgDialComponent } from '../show-temp-msg-dial/show-temp-msg-dial.component';

@Component({
	selector: 'app-tax-amount-dialog',
	templateUrl: './tax-amount-dialog.component.html',
	styleUrls: ['./tax-amount-dialog.component.scss']
})
export class TaxAmountDialogComponent implements OnInit {

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { taxAmount: number },
		public dialogRef: MatDialogRef<TaxAmountDialogComponent>,
		private dmiService: DmiServiceService,
		private matDialog: MatDialog
	) { }

	ngOnInit(): void {
	}
	onSaveValues() {
		localStorage.setItem(
			'savedForm',
			this.dmiService.finalForm
		);
		this.dialogRef.close();
		this.dmiService.openSnackBar('Voatahiry ny vinavinan-ketra nataonao', 'snackbarPanelStyle');

	}
	openSuccessMsg(msg: string) {
		const timeout = 3000;
		const dialogRef = this.matDialog.open(ShowTempMsgDialComponent, {
			width: '300px',
			data: { msg }
		});
		dialogRef.afterOpened().subscribe(_ => {
			setTimeout(() => {
				dialogRef.close();
			}, timeout)
		});
	}
}
