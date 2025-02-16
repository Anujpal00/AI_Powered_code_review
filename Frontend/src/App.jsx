import { useState , useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import prism from "prismjs";
import Editor from "react-simple-code-editor";
import './App.css';
import axios from 'axios';
import Markdown from "react-markdown";
import rehypeHightlight from 'rehype-highlight';
import "highlight.js/styles/github-dark.css";




function App() {
  
  const [code,setcode] = useState(`function sum(){
            return 1+1}`)


  const [review, setreview] = useState(``)

useEffect(()=>{
  prism.highlightAll()
})

async function reviewCode(){
  const response = await axios.post('http://localhost:3000/ai/get-review',{code})
 setreview(response.data)

}

  return (
    <>
    <main>
    <div className="left">
      <div className="code">
        <Editor
        value={code}
        onValueChange={code => setcode(code)}
        highlight={(code) => prism.highlight(code, prism.languages.javascript , 'javascript' )}
        padding={10}
        style={{
          fontSize: 16,
          fontFamily: '"Fira Code","Fira Mono", monospace',
          width: '100%',
          height: '100%',
          
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
        />
      </div>
        <div 
        onClick={reviewCode}
        
        className="review">Review</div>
      
    </div>
    <div className="right">
      <Markdown
      
      rehypePlugins={[rehypeHightlight]}
      
      
      >{review}</Markdown>
    </div>




      </main>
      
      
      </>
  )
}



export default App
