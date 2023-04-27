import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{

  message: string = ''
  isBotTyping: boolean = false
  history: any

  constructor( private chat: ChatService ) {}

  ngOnInit(): void {    
    this.chat.history.subscribe({
      next: (data) => this.history = data,
      error: (err) => console.error(err)
    })
  }

  async sendMessage() {
    var msg = this.message
    this.message = ''
    this.isBotTyping = true

    await this.chat.getResponse(msg)

    this.isBotTyping = false
  }

}
