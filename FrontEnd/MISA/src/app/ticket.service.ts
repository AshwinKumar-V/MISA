import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TicketService{

  ticket_id = new BehaviorSubject<string>("")
  all_tickets = new BehaviorSubject<Array<object>>([])
  ticket = new BehaviorSubject<object>({})

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    // get all tickets
    this.getAllTickets()

    // subscribe to changes in ticket_id
    this.ticket_id.subscribe({
      next: async () => {
        await this.getTicket()
      },
      error:(err) => console.error(err)
    })
  }

  // get all tickets
  async getAllTickets() {
    try {
      var headers = new HttpHeaders().set("user_id", "u123")
      var response = await lastValueFrom(this.http.get(`${environment.TICKETING_SERVICE_ADDRESS}/tickets`, { headers: headers }))
      if (!response) {
        console.error("Error fetching all tickets")
        return
      }
      this.all_tickets.next((response as any).tickets)
    }
    catch(err:any) {
      console.error("Error fetching all tickets")
      this.snackBar.open("Error fetching all tickets", '' ,{duration: 2500})
      return
    }
  }

  // get a ticket
  async getTicket() {
    try {
      var headers = new HttpHeaders().set("user_id", "u123")
      var response = await lastValueFrom(this.http.get(`${environment.TICKETING_SERVICE_ADDRESS}/tickets/${this.ticket_id.getValue()}`, { headers: headers }))
      if (!response) {
        console.error("Error fetching ticket")
        return
      }
      this.ticket.next((response as any))
    }
    catch(err:any) {
      console.error("Error fetching ticket")
      this.snackBar.open("Error fetching ticket", '' ,{duration: 2500})
      return
    }
  }

  // update ticket status
  async updateTicketStatus(status: string) {
    try {
      var headers = new HttpHeaders().set("user_id", "u123")
      await lastValueFrom(this.http.patch(`${environment.TICKETING_SERVICE_ADDRESS}/tickets/${this.ticket_id.getValue()}`, { status: status },  { headers: headers }))
      await this.getTicket()
    }
    catch(err:any) {
      console.error("Error updating ticket status")
      this.snackBar.open("Error updating ticket status", '' ,{duration: 2500})
      return
    }
  }

}
