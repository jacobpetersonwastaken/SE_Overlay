import {
	GPT_KEY,
} from '../keys.js';

export async function gptGeneration(style, text) {
  
  const prompt = generatePrompt(style, text);
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GPT_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      temperature: 1.5,
      messages: [
        {
          role: "system",
          content: "You help translate things into different styles of english for jokes"
        },
        {
          role: "user",
          content: prompt,
        }
      ]
    })
  });

  const data = await response.json();
  console.log(data);
  return data.choices[0].message.content;
}

function generatePrompt(style, text) {
  const prompt_style = getStyle(style);
  return `${prompt_style} Text:"${text}"`;
}

function getStyle(style) {
  switch(true) {
    case style.includes('old english'):
      return 'Change this text to old styled English';
    case style.includes('uwu'):
      return 'Change this text to uwu anime styled English';
    case style.includes('gangster'):
      return 'Change this text to gangster styled English';
      case style.includes('pig latin'):
        return 'Change this text to pig latin';
  };


}


