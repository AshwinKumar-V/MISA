import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ChatService{

  conversation_id = new BehaviorSubject<string>("")
  all_conversations = new BehaviorSubject<Array<object>>([])
  history = new BehaviorSubject<Array<{
    role: string,
    content: string,
    error?: string
  }>>([]);

  constructor(private http: HttpClient) {
    // get all conversations
    this.getAllConversations()

    // subscribe to changes in conversation_id
    this.conversation_id.subscribe({
      next: async () => {
        await this.getConversation()
      },
      error:(err) => console.error(err)
    })
  }

  // create new conversation
  async createConversation() {
    try {
      var headers = new HttpHeaders().set("user_id", "u123")      
      var response = await lastValueFrom(this.http.post(`${environment.CONVERSATION_SERVICE_ADDRESS}/conversations`, null, { headers: headers }))
      if (!response) {
        console.error("Error creating new conversation")
        return
      }

      await this.getAllConversations()
      this.conversation_id.next((response as any).conversation_id)
      
    }
    catch(err:any) {
      console.error("Error creating new conversation")
      return
    }
  }

  // get all conversations
  async getAllConversations() {
    try {
      var headers = new HttpHeaders().set("user_id", "u123")
      var response = await lastValueFrom(this.http.get(`${environment.CONVERSATION_SERVICE_ADDRESS}/conversations`, { headers: headers }))
      if (!response) {
        console.error("Error fetching all conversations")
        return
      }
      this.all_conversations.next((response as any).conversations)
    }
    catch(err:any) {
      console.error("Error fetching all conversations")
      return
    }
  }

  // get a conversation
  async getConversation() {
    try {
      var headers = new HttpHeaders().set("user_id", "u123")
      var response = await lastValueFrom(this.http.get(`${environment.CONVERSATION_SERVICE_ADDRESS}/conversations/${this.conversation_id.getValue()}`, { headers: headers }))
      if (!response) {
        console.error("Error fetching conversation")
        return
      }
      var messages = (response as any).messages

      // extracting only user and assistant responses
      messages.forEach((message:any, index:any) => {
        if (message.role == 'assistant') {
          var content = JSON.parse(message.content)

          if(content.action == 'respond') {
            // action: respond
            message.content = content.bot_response
          }
          else {
            // action: ticket
            message.role = 'ticket'
          }
        }

        if (!['user', 'assistant'].includes(message.role)) {
          messages.splice(index, 1)
        }
      })

      this.history.next([{role: "assistant", content: "Hey, how can I help you?"}].concat(...messages))
    }
    catch(err:any) {
      console.error("Error fetching conversation")
      return
    }
  }

  // get response from NLP service
  async getResponse(message:string) {
    var history_temp = this.history.getValue()
    try{
      history_temp.push({role: "user", content: message, error: undefined})
      history_temp.push({role: "assistant", content: "Typing...", error: undefined})

      var headers = new HttpHeaders().set("user_id", "u123")
      var response = await lastValueFrom(this.http.post(`${environment.NLP_SERVICE_ADDRESS}/chat/${this.conversation_id.getValue()}`, {prompt: message}, { headers: headers }))
      if (response) {
        history_temp.pop()
        history_temp.push({role: "assistant", content: (response as any).response, error: undefined})
      }
      else {
        history_temp.pop()
        var last: any = history_temp.pop()
        last.error = "Try again!"
        history_temp.push(last)
      }
    }
    catch(err:any) {
      history_temp.pop()
      var last: any = history_temp.pop()
      last.error = err.statusText
      history_temp.push(last)
    }
    this.history.next(history_temp)
    return
  }

  // update conversation title
  async updateConversationTitle(title: string) {
    try {
      var headers = new HttpHeaders().set("user_id", "u123")
      await lastValueFrom(this.http.patch(`${environment.CONVERSATION_SERVICE_ADDRESS}/conversations/${this.conversation_id}`, { title: title },  { headers: headers }))
      await this.getAllConversations()
    }
    catch(err:any) {
      console.error("Error updating conversation title")
      return
    }
  }

}
