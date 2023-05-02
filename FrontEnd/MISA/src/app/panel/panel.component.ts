import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { TicketService } from '../ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { TitleDialogComponent } from '../title-dialog/title-dialog.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit{

  list: any
  role: string = ''

  constructor(
    private router: Router,
    private chat: ChatService,
    private ticket: TicketService,
    private dialog : MatDialog) {}

  ngOnInit(): void {
    this.chat.all_conversations.subscribe({
      next: (data) => this.list = data,
      error: (err) => console.error(err)
    })

    this.ticket.all_tickets.subscribe({
      next: (data) => this.list = data,
      error: (err) => console.error(err)
    })

    this.router.events.subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          console.log(event.url);
          this.role = event.url

          if(this.role == '/user'){
            this.chat.getAllConversations()
          }
          else {
            this.ticket.getAllTickets()
          }
        }
      },
      error: (err) => console.error(err)
    })
  }

  newChat() {
    this.chat.createConversation()
  }

  changeConversation(id: string) {
    this.chat.conversation_id.next(id)
  }

  changeTicket(id:string) {
    this.ticket.ticket_id.next(id)
  }

  changeItem(id: string) {
    return this.role == '/user'? this.changeConversation(id): this.changeTicket(id)
  }

  async editTitle() {
    var dialogRef = this.dialog.open(TitleDialogComponent)
    var title = await lastValueFrom(dialogRef.afterClosed())
    if (title) {
      this.chat.updateConversationTitle(title)
    }
    return
  }
}
