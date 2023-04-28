import { Component, OnInit } from '@angular/core';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit{

  curr_ticket: any

  constructor(private ticket: TicketService) {}
  ngOnInit(): void {
    this.ticket.ticket.subscribe({
      next: (data) => this.curr_ticket = data,
      error: (err) => console.error(err)
    })
  }


  async closeTicket(){
    await this.ticket.updateTicketStatus('closed')
  }
}
