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
  history: Array<{
    role: string,
    text: string
  }> = [];

  constructor(
    private http: HttpClient) {}

  ngOnInit(): void {
    this.history.splice(0, this.history.length)
  }

  async sendMessage() {
    this.history.push({role: "user", text: this.message})
    this.message = ''

    // get response from NLP service
    try{
      var data = await lastValueFrom(this.http.post("http://127.0.0.1:3000/ask", {prompt: this.message}))
      if ((data as any).success) {
        this.history.push({role: "assistant", text: (data as any).message})
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
