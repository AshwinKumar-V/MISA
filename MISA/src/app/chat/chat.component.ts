import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  message: string = ''
  isBotTyping: boolean = false
  history: Array<{
    role: string,
    text: string,
    time: Date,
    error?: string
  }> = [];

  constructor(
    private http: HttpClient) {}

  ngOnInit(): void {
    this.history.push({role: "assistant", text: "Hey, how can I help you?", time: new Date(), error: undefined})
  }

  async sendMessage() {
    this.history.push({role: "user", text: this.message, time: new Date(), error: undefined})
    this.history.push({role: "assistant", text: 'Typing...', time: new Date(), error: undefined})
    this.message = ''
    this.isBotTyping = true

    // get response from NLP service
    try{
      var headers = new HttpHeaders().set('user_id', "u123")
      var response = await lastValueFrom(this.http.post("http://localhost:8000/chat", {prompt: this.message}, { headers: headers }))
      if (response) {
        this.history.pop()
        this.history.push({role: "assistant", text: (response as any).response, time: new Date()})
      }
      else {
        this.history.pop()
        var last: any = this.history.pop()
        last.error = "Try again!"
        this.history.push(last)
      }
    }
    catch(err:any) {
      this.history.pop()
      var last: any = this.history.pop()
      last.error = err.statusText
      this.history.push(last)
    }

    this.isBotTyping = false
  }


}
