import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit{

  list: any

  constructor(
    private router: Router,
    private chat: ChatService) {}

  ngOnInit(): void {
    this.chat.all_conversations.subscribe({
      next: (data) => this.list = data,
      error: (err) => console.error(err)
    })
  }

  newChat() {
    this.chat.createConversation()
  }

  changeConversation(id: string) {
    this.chat.conversation_id.next(id)
  }

}
