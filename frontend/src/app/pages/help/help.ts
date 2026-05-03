import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ChatMessage = {
  sender: 'bot' | 'user';
  text: string;
};

type HelpAnswer = {
  question: string;
  answer: string;
  keywords: string[];
};

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help.html'
})
export class Help {
  userMessage = '';

  quickAnswers: HelpAnswer[] = [
    {
      question: 'What is my pending payment?',
      answer: 'Open Fees from the sidebar to view your pending dues, paid total, and payment history.',
      keywords: ['pending', 'payment', 'fee', 'dues']
    },
    {
      question: 'How can I apply for leave?',
      answer: 'Go to Leave Requests, enter your reason and dates, then submit the request for admin approval.',
      keywords: ['leave', 'apply', 'absence']
    },
    {
      question: 'How to register complaint?',
      answer: 'Open Complaints, write your issue clearly, and submit it. You can track the latest status from your dashboard.',
      keywords: ['complaint', 'issue', 'problem']
    },
    {
      question: 'Are rooms available?',
      answer: 'Open Rooms to check available capacity. If you are a student, you can request an available room from there.',
      keywords: ['room', 'available', 'vacancy']
    },
    {
      question: 'How to contact admin?',
      answer: 'Use the Contact page for the admin email, phone number, and hostel office address.',
      keywords: ['contact', 'admin', 'phone', 'email']
    }
  ];

  messages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Hi, I can help with payments, leave, complaints, rooms, and admin contact details.'
    }
  ];

  ask(question: string) {
    this.userMessage = question;
    this.sendMessage();
  }

  sendMessage() {
    const message = this.userMessage.trim();

    if (!message) {
      return;
    }

    this.messages.push({ sender: 'user', text: message });
    this.messages.push({ sender: 'bot', text: this.findAnswer(message) });
    this.userMessage = '';
  }

  private findAnswer(message: string) {
    const normalizedMessage = message.toLowerCase();
    const exactMatch = this.quickAnswers.find((item) => item.question.toLowerCase() === normalizedMessage);

    if (exactMatch) {
      return exactMatch.answer;
    }

    const keywordMatch = this.quickAnswers.find((item) =>
      item.keywords.some((keyword) => normalizedMessage.includes(keyword))
    );

    return keywordMatch?.answer || 'I could not find an exact answer. Please contact the admin from the Contact page.';
  }
}
