import { Component } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent {

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
