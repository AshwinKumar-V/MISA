import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  message: string = ''
  time: string = ''
  history: Array<{
    role: string,
    text: string,
    time: Date
  }> = [];

  constructor(
    private http: HttpClient) {}

  ngOnInit(): void {
    this.history.splice(0, this.history.length)
  }

  async sendMessage() {
    this.history.push({role: "user", text: this.message, time: new Date()})
    this.message = ''
    this.history.push({role: "assistant", text: 'Typing...', time: new Date()})

    // get response from NLP service
    try{
      var data = await lastValueFrom(this.http.post("http://127.0.0.1:3000/ask", {prompt: this.message}))
      if ((data as any).success) {
        this.history.pop()
        this.history.push({role: "assistant", text: (data as any).message, time: new Date()})
      }
      else {
        console.error("Server error.")
      }
    }
    catch(err) {
      console.error("Server error.")
    }
  }


}
