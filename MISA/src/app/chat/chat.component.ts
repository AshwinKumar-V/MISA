import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  message: string = ''
  history: Array<{
    role: string,
    text: string
  }> = [];

  ngOnInit(): void {
    this.history.splice(0, this.history.length)
  }

  sendMessage() {
    this.history.push({role: "user", text: this.message})
    this.history.push({role: "assistant", text: this.message})
    this.message = ''
  }
}
