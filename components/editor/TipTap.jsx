'use client'

import '@/components/editor/editor.css'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { Paragraph } from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorProvider, useCurrentEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react'

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },
});

const MenuBar = ({ readOnly = false }) => {
  const { editor } = useCurrentEditor()

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <s>Strike</s>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          Blockquote
        </button>
      </div>
    </div>
  )
}

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    codeBlock: false
  }),
  CustomParagraph,
  Placeholder.configure({
    placeholder: 'Start typing here...',
  }),
]

const ContentEditor = ({ value, onChange, isClear, defaultValue, editorType, readOnly }) => {
  const editorContext = useCurrentEditor();
  const editor = editorContext?.editor;
  const [isPlaceholderCleared, setIsPlaceholderCleared] = useState(false);

  // Imposta lo stato di readOnly dell'editor quando cambia la prop
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  useEffect(() => {
    if (isClear && isPlaceholderCleared) {
      editor?.commands.clearContent();
    }
  }, [isClear, editor, isPlaceholderCleared]);
  
  useEffect(() => {
    if (!editor) return;

    // Different placeholder text based on editorType
    const placeholderText = editorType === 'bio' 
      ? 'Scrivi qualcosa su di te...'
      : 'Usa questo spazio per scrivere un commento da lasciare sotto al post!';
    const placeholderStyle = 'font-size: 0.8rem; color: grey';

    const handleTransaction = ({ transaction }) => {
      const placeholderStep = transaction.steps.find(step => {
        const slice = step.slice?.content?.content?.[0];
        const textNode = slice?.content?.content?.[0];
        return (
          slice?.attrs?.style === placeholderStyle &&
          textNode?.text.includes(placeholderText)
        );
      });

      if (placeholderStep) {
        setIsPlaceholderCleared(false); // Reset the cleared flag
        editor.commands.blur(); // Programmatically blur to trigger focus again
      }
    };

    const handleFocus = () => {
      if (isPlaceholderCleared || readOnly) return;

      const jsonContent = editor.getJSON();
      if (
        jsonContent.content &&
        jsonContent.content.length === 1 &&
        jsonContent.content[0].type === 'paragraph' &&
        jsonContent.content[0].attrs?.style === placeholderStyle &&
        jsonContent.content[0].content?.[0]?.text === placeholderText
      ) {
        editor.commands.clearContent(); // Clear the placeholder
        setIsPlaceholderCleared(true); // Mark as cleared
      }
    };
    
    const handleUpdate = () => {
      if (readOnly) return; // Non aggiornare il valore in modalità readOnly
      
      const content = editor.getHTML();
      if (content !== value) {
        onChange(content);
      }
    };

    editor.on('focus', handleFocus);
    editor.on('transaction', handleTransaction);
    editor.on('update', handleUpdate);

    return () => {
      editor.off('focus', handleFocus);
      editor.off('transaction', handleTransaction);
      editor.off('update', handleUpdate);
    };
  }, [editor, isPlaceholderCleared, editorType, value, onChange, readOnly]);

  useEffect(() => {
    if (editor && defaultValue) {
      editor.commands.setContent(defaultValue);
    }
  }, [defaultValue, editor]);

  return <EditorContent />;
};

// Get initial content based on editor type
const getInitialContent = (editorType) => {
  if (editorType === 'bio') {
    return `<p style="font-size: 0.8rem; color: grey">Scrivi qualcosa su di te...</p>`;
  }
  return `<p style="font-size: 0.8rem; color: grey">Usa questo spazio per scrivere un commento da lasciare sotto al post!</p>`;
};

const EditorWithTheme = ({ 
  value, 
  onChange, 
  isClear, 
  defaultValue, 
  editorType,
  readOnly = false
}) => {
  const { theme } = useTheme(); // Access the current theme
  const initialContent = defaultValue || getInitialContent(editorType);

  // Determine the CSS class based on editorType
  let editorClass = 'main-editor';
  if (editorType === 'comment') {
    editorClass = 'comment-editor';
  } else if (editorType === 'bio') {
    editorClass = 'bio-editor';
  }

  // Aggiungi una classe per lo stato readOnly
  const readOnlyClass = readOnly ? 'editor-readonly' : '';

  return (
    <div className={`theme-${theme} ${editorClass} ${readOnlyClass}`}>
      <EditorProvider
        slotBefore={<MenuBar readOnly={readOnly} />}
        extensions={extensions}
        content={initialContent}
        editorContainerProps={{ className: 'editor-container' }}
        editable={!readOnly} // Importante: imposta l'editor come non modificabile se readOnly è true
      >
        <ContentEditor 
          value={value} 
          onChange={onChange} 
          isClear={isClear} 
          defaultValue={defaultValue} 
          editorType={editorType}
          readOnly={readOnly}
        />
      </EditorProvider>
    </div>
  );
};

export default EditorWithTheme;