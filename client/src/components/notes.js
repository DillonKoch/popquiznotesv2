/*
 *  ==============================================================================
 *  File: notes.js
 *  Project: client
 *  File Created: Sunday, 19th December 2021 12:03:40 pm
 *  Author: Dillon Koch
 *  -----
 *  Last Modified: Sunday, 19th December 2021 12:03:41 pm
 *  Modified By: Dillon Koch
 *  -----
 * 
 *  -----
 *  Putting the notes in Popquiznotes
 *  ==============================================================================
 */


import axios from 'axios';
import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import "../App.css";
import S3 from 'react-aws-s3'
var crypto = require('crypto');

function _increment_concept(sequence) {
    // * adding 1 to the concept value (third) in a sequence
    const sequence_vals = sequence.split('.')
    sequence_vals[2]++
    console.log(sequence, sequence_vals.join('.'))
    return sequence_vals.join('.')
}

function _find_concept_sequence(sequence) {
    // * returning the sequence of just the concept, not other values after the third
    const sequence_vals = sequence.split('.').slice(0, 3);
    const concept_sequence = sequence_vals.join('.')
    return concept_sequence
}

function _find_question_sequence(sequence) {
    // * returning the sequence of just the question, not other values after the fourth
    const sequence_vals = sequence.split('.').slice(0, 4);
    const question_sequence = sequence_vals.join('.')
    return question_sequence
}

function _find_last_sequence_val(sequence) {
    // * finding the integer of the last value in the sequence
    const sequence_vals = sequence.split('.')
    return parseInt(sequence_vals.slice(-1)[0]);
}

function _find_concept_val(sequence) {
    // * finding the value of the concept in a sequence (third)
    const sequence_vals = sequence.split('.')
    return sequence_vals[2]
}

function _sort_by_sequence(arr) {
    // * sorting an array of objects by the 'Sequence' in each object
    arr.sort(function (a, b) {
        var keyA = a['Sequence'],
            keyB = b['Sequence'];
        // Compare the 2 sequences
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    })
    return arr
}

function _find_sequence_val(sequence, index) {
    // * finding the integer of the index in the sequence
    const sequence_vals = sequence.split('.')
    return parseInt(sequence_vals[index])
}

function _sort_by_sequence_val(arr, val) {
    // * sorting an array of objects by the 'Sequence' in each object
    // * sorting by the integer of the 'val' (question val, answer val, etc)
    arr.sort(function (a, b) {
        var keyA = _find_sequence_val(a['Sequence'], val),
            keyB = _find_sequence_val(b['Sequence'], val);
        // Compare the 2 sequences
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    })
    return arr;
}


function Concept(props) {
    const [concept, setConcept] = useState(props.concept)

    useEffect(() => {
        setConcept([])
        setConcept(props.concept)
    }, [props.concept])

    function handleChange(event) {
        let newValue = event.target.value;
        setConcept(prevState => {
            let newConcept = { ...prevState, Changed: true };
            newConcept['Concept Name'] = newValue;
            props.handleChange(newConcept);
            return newConcept;
        });
    }

    function handleKeyDown(event) {
        props.handleKeyDown(event, concept)
    }

    return (
        <div>
            <TextareaAutosize
                type="text"
                value={concept['Concept Name']}
                className="concept"
                rows="1"
                onChange={(event) => handleChange(event)}
                onKeyDown={(event) => handleKeyDown(event)}
            />
        </div>
    )
}

function Katex(props) {
    return (
        <div className="katex">
            <InlineMath math={String(props.text)} />
        </div>
    )
}

function Note(props) {
    const [note, setNote] = useState(props.note);
    const [showupload, setShowupload] = useState(false);

    useEffect(() => {
        setNote([])
        setNote(props.note)
    }, [props.note])

    function handleChange(event) {
        let newValue = event.target.value;
        setNote(prevState => {
            let newNote = { ...prevState, Changed: true };
            newNote['Note'] = newValue;
            props.handleChange(newNote);
            return newNote;
        })
    }

    function handleNoteKeyDown(event) {
        props.handleKeyDown(event, note)

        if (event.ctrlKey && event.keyCode === 73) {
            setShowupload(!showupload)
        }
    }

    return (
        <div className={"indent" + note['Indent Level']}>
            <TextareaAutosize
                type="text"
                value={note['Note']}
                className="note"
                rows="1"
                onChange={(event) => handleChange(event)}
                onKeyDown={(event) => handleNoteKeyDown(event)}
            />
            {props.note['Latex'] === true ? <Katex text={note['Note']} /> : null}
            {props.note['Image'] === "" ? null : <img src={props.note['Image']} alt="" className="img"></img>}
            {((props.note['Image'] === "") & showupload) ?
                <input type="file" onChange={(event) => props.uploadImage(event, props.note)}></input> : null}
        </div>
    )
}


function NotesSection(props) {
    const [conceptnotes, setConceptnotes] = useState([]);

    useEffect(() => {
        var new_concept_notes = [];
        for (var i = 0; i < props.notes.length; i++) {
            const concept_sequence = _find_concept_sequence(props.notes[i]['Sequence'])
            if (concept_sequence === props.concept['Sequence']) {
                new_concept_notes.push(props.notes[i]);
            }
        }
        new_concept_notes = _sort_by_sequence_val(new_concept_notes, 3)
        setConceptnotes([])
        console.log(new_concept_notes)
        setConceptnotes(new_concept_notes)
    }, [props.notes, props.concept])

    return (
        <div>
            {conceptnotes.map((conceptnote, index) => {
                return (
                    <div key={index}>
                        <Note
                            note={conceptnote}
                            handleChange={props.handleChange}
                            handleKeyDown={props.handleKeyDown}
                            uploadImage={props.uploadImage}
                        />
                    </div>
                )
            })}
        </div>
    )
}

function Question(props) {
    const [question, setQuestion] = useState(props.question);
    const [showupload, setShowupload] = useState(false);

    useEffect(() => {
        setQuestion([])
        setQuestion(props.question)
    }, [props.question])

    function handleChange(event) {
        let newValue = event.target.value;
        setQuestion(prevState => {
            let newQuestion = { ...prevState, Changed: true };
            newQuestion['Question'] = newValue;
            props.handleChange(newQuestion);
            return newQuestion;
        })
    }

    function handleKeyDown(event) {
        console.log('question key down')
        props.handleKeyDown(event, question)

        if (event.ctrlKey && event.keyCode === 73) {
            setShowupload(!showupload)
            console.log('show upload')
        }
    }

    return (
        <div className={"indent" + question['Indent Level']}>
            <TextareaAutosize
                type="text"
                value={question['Question']}
                className="question"
                rows="1"
                onChange={(event) => handleChange(event)}
                onKeyDown={(event) => handleKeyDown(event)}
            />
            {question['Latex'] === true ? <Katex text={question['Question']} /> : null}
            {question['Image'] === "" ? null : <img src={question['Image']} alt="" className="img"></img>}
            {((question['Image'] === "") & showupload) ?
                <input type="file" onChange={(event) => props.uploadImage(event, question)}></input> : null}
        </div>
    )
}

function Answer(props) {
    const [answer, setAnswer] = useState(props.answer);
    const [showupload, setShowupload] = useState(false);

    useEffect(() => {
        setAnswer([])
        setAnswer(props.answer)
    }, [props.answer])

    function handleChange(event) {
        let newValue = event.target.value;
        setAnswer(prevState => {
            let newAnswer = { ...prevState, Changed: true };
            newAnswer['Answer'] = newValue;
            props.handleChange(newAnswer);
            return newAnswer;
        })
    }

    function handleKeyDown(event) {
        props.handleKeyDown(event, answer)

        if (event.ctrlKey && event.keyCode === 73) {
            setShowupload(!showupload)
        }
    }

    return (
        <div className={"indent" + answer['Indent Level']}>
            <TextareaAutosize
                type="text"
                value={answer['Answer']}
                className="answer"
                rows="1"
                onChange={(event) => handleChange(event)}
                onKeyDown={(event) => handleKeyDown(event)}
            />
            {answer['Latex'] === true ? <Katex text={answer['Answer']} /> : null}
            {props.answer['Image'] === "" ? null : <img src={props.answer['Image']} alt="" className="img"></img>}
            {((props.answer['Image'] === "") & showupload) ?
                <input type="file" onChange={(event) => props.uploadImage(event, props.answer)}></input> : null}
        </div>
    )
}

function AnswerSection(props) {
    const [questionanswers, setQuestionanswers] = useState([]);

    useEffect(() => {
        console.log('answer section')
        // * filtering down props.answers to only the answers for the current question
        var new_question_answers = []
        for (var i = 0; i < props.answers.length; i++) {
            const question_sequence = _find_question_sequence(props.answers[i]['Sequence'])
            if (question_sequence === props.question['Sequence']) {
                new_question_answers.push(props.answers[i]);
            }
        }
        new_question_answers = _sort_by_sequence_val(new_question_answers, 4)
        setQuestionanswers([]);
        setQuestionanswers(new_question_answers);
    }, [props.answers, props.question])

    return (
        <div>
            {questionanswers.map((answer, index) => {
                return (
                    <div key={index}>
                        <Answer
                            key={index + 'qa'}
                            answer={answer}
                            handleChange={props.handleChange}
                            handleKeyDown={props.handleKeyDown}
                            uploadImage={props.uploadImage}
                        />
                    </div>
                )
            })}
        </div>
    )
}

function QuestionAnswers(props) {
    const [conceptquestions, setConceptquestions] = useState([]);
    const [conceptanswers, setConceptanswers] = useState([]);

    useEffect(() => {
        // ! QUESTIONS
        console.log(props.questions.length)
        // filter down to current concept, sort
        var current_concept_questions = [];
        for (var i = 0; i < props.questions.length; i++) {
            const question = props.questions[i];
            const question_concept_sequence = _find_concept_sequence(question['Sequence'])
            if (question_concept_sequence === props.concept['Sequence']) {
                current_concept_questions.push(question);
            }
        }
        current_concept_questions = _sort_by_sequence_val(current_concept_questions, 3)
        setConceptquestions([])
        setConceptquestions(current_concept_questions);

        // ! ANSWERS
        console.log(props.answers.length)
        // filter down to current concept (gets filtered down to certain question next in answerssection)
        var current_concept_answers = [];
        for (var j = 0; j < props.answers.length; j++) {
            const answer = props.answers[j];
            const answer_concept_sequence = _find_concept_sequence(answer['Sequence'])
            if (answer_concept_sequence === props.concept['Sequence']) {
                current_concept_answers.push(answer);
            }
        }
        setConceptanswers([])
        setConceptanswers(current_concept_answers);

    }, [props.questions, props.answers, props.concept])

    return (
        <div>
            {conceptquestions.map((question, index) => {
                return (
                    <div key={index}>
                        <Question
                            key={index + 'q'}
                            question={question}
                            handleChange={props.handleQuestionChange}
                            handleKeyDown={props.handleQuestionKeyDown}
                            uploadImage={props.uploadImage}
                        />
                        <AnswerSection
                            key={index + 'a'}
                            question={question}
                            answers={conceptanswers}
                            handleChange={props.handleAnswerChange}
                            handleKeyDown={props.handleAnswerKeyDown}
                            uploadImage={props.uploadImage}
                        />
                    </div>
                )
            })}
        </div>
    )
}


function Notes(props) {
    const [concepts, setConcepts] = useState([]);
    const [notes, setNotes] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        // * building URL
        var url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Notes";
        var url_param_string = `?class=${props.classname}&section=${props.sectionname}&subsection=${props.subsectionname}`;
        var url = url_base_string + url_param_string.replace(/ /g, '%20');
        console.log(url)
        // * load data, update the concept/note/question/answer arrays
        axios.get(url).then((res) => {
            console.log(res.data);
            var new_concepts = [];
            var new_notes = [];
            var new_questions = [];
            var new_answers = [];
            for (var i = 0; i < res.data.length; i++) {
                const current_document = res.data[i];
                if (current_document['type'] === "Concept") {
                    new_concepts.push(current_document);
                } else if (current_document['type'] === "Note") {
                    new_notes.push(current_document);
                } else if (current_document['type'] === "Question") {
                    new_questions.push(current_document);
                } else if (current_document['type'] === "Answer") {
                    new_answers.push(current_document);
                }
            }
            setConcepts(new_concepts);
            setNotes(new_notes);
            setQuestions(new_questions);
            setAnswers(new_answers);
            console.log('concepts', new_concepts);
            console.log('notes', new_notes);
            console.log('questions', new_questions);
            console.log('answers', new_answers);
        })
    }, [props.subsectionname, props.sectionname, props.classname])

    function build_new_concept(new_sequence) {
        var new_concept = {
            "_id": { "$oid": crypto.randomBytes(12).toString('hex') },
            "Section": props.sectionname, "Subsection": props.subsectionname,
            "type": "Concept", "Sequence": new_sequence, "Changed": true, "Concept Name": ""
        }
        return new_concept;
    }

    function build_new_note(new_sequence) {
        const new_note = {
            "_id": { "$oid": crypto.randomBytes(12).toString('hex') }, "Note": "",
            "Section": props.sectionname, "Subsection": props.subsectionname,
            "type": "Note", "Sequence": new_sequence, "Changed": true,
            "Image": "", "Latex": false, "Indent Level": "1"
        };
        return new_note;
    }

    function build_new_answer(new_sequence) {
        const new_answer = {
            "_id": { "$oid": crypto.randomBytes(12).toString('hex') }, "Answer": "",
            "Section": props.sectionname, "Subsection": props.subsectionname,
            "type": "Answer", "Sequence": new_sequence, "Changed": true,
            "Image": "", "Latex": false, "Indent Level": "1"
        };
        return new_answer;
    }

    function build_new_question(new_sequence) {
        const new_question = {
            "_id": { "$oid": crypto.randomBytes(12).toString('hex') }, "Question": "",
            "Section": props.sectionname, "Subsection": props.subsectionname,
            "type": "Question", "Sequence": new_sequence, "Changed": true,
            "Image": "", "Latex": false, "Indent Level": "1"
        };
        return new_question;
    }

    function handleConceptChange(newConcept) {
        console.log('concept change')
        var new_concepts = [];
        for (var i = 0; i < concepts.length; i++) {
            const concept = concepts[i];
            if (concept['Sequence'] === newConcept['Sequence']) {
                new_concepts.push(newConcept);
            } else {
                new_concepts.push(concept);
            }
        }
        setConcepts(new_concepts);
    }

    function handleNoteChange(newNote) {
        console.log('note change')
        var new_notes = [];
        for (var i = 0; i < notes.length; i++) {
            const note = notes[i];
            if (note['Sequence'] === newNote['Sequence']) {
                new_notes.push(newNote);
            } else {
                new_notes.push(note);
            }
        }
        setNotes(new_notes);
    }

    function handleQuestionChange(newQuestion) {
        console.log('question change')
        var new_questions = [];
        for (var i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (question['Sequence'] === newQuestion['Sequence']) {
                new_questions.push(newQuestion);
            } else {
                new_questions.push(question);
            }
        }
        setQuestions(new_questions);
    }

    function handleAnswerChange(newAnswer) {
        console.log('answer change')
        var new_answers = [];
        for (var i = 0; i < answers.length; i++) {
            const answer = answers[i];
            if (answer['Sequence'] === newAnswer['Sequence']) {
                new_answers.push(newAnswer);
            } else {
                new_answers.push(answer);
            }
        }
        setAnswers(new_answers);
    }

    function saveDocuments(event) {
        var all_documents = concepts.concat(notes, questions, answers);
        for (var i = 0; i < all_documents.length; i++) {
            const document = all_documents[i];
            if (document['Changed'] === true) {
                axios.post(`https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Update_Document?class=${props.classname}`, document).then((res) => {
                    console.log('body', res.data)
                })
            }
        }
    }

    function handleConceptKeyDown(event, concept) {
        console.log('concept key down')

        if (event.keyCode === 13) {
            console.log('enter')
            event.preventDefault()

            const concept_sequence = concept['Sequence']
            const concept_last_val = _find_last_sequence_val(concept_sequence)

            // * loop through all concepts, notes, questions, answers to update sequences
            // * concepts
            var new_concepts = [];
            for (var i = 0; i < concepts.length; i++) {
                const current_concept = concepts[i]
                const current_concept_last_val = _find_last_sequence_val(current_concept['Sequence'])
                if (current_concept_last_val > concept_last_val) {
                    current_concept['Sequence'] = _increment_concept(current_concept['Sequence'])
                }
                new_concepts.push(current_concept)
            }
            // * notes
            var new_notes = [];
            for (var j = 0; j < notes.length; j++) {
                const current_note = notes[j]
                const current_note_concept_val = _find_concept_val(current_note['Sequence'])
                if (current_note_concept_val > concept_last_val) {
                    current_note['Sequence'] = _increment_concept(current_note['Sequence'])
                }
                new_notes.push(current_note)
            }
            // * questions
            var new_questions = [];
            for (var k = 0; k < questions.length; k++) {
                const current_question = questions[k]
                const current_question_concept_val = _find_concept_val(current_question['Sequence'])
                if (current_question_concept_val > concept_last_val) {
                    current_question['Sequence'] = _increment_concept(current_question['Sequence'])
                }
                new_questions.push(current_question)
            }
            // * answers
            var new_answers = [];
            for (var l = 0; l < answers.length; l++) {
                const current_answer = answers[l]
                const current_answer_concept_val = _find_concept_val(current_answer['Sequence'])
                if (current_answer_concept_val > concept_last_val) {
                    current_answer['Sequence'] = _increment_concept(current_answer['Sequence'])
                }
                new_answers.push(current_answer)
            }

            // * adding new concept/note/question/answer
            const new_concept_sequence = _increment_concept(concept_sequence)
            const new_concept = build_new_concept(new_concept_sequence);
            const new_note = build_new_note(new_concept_sequence + '.1');
            const new_question = build_new_question(new_concept_sequence + '.1');
            const new_answer = build_new_answer(new_concept_sequence + '.1.1');
            new_concepts.push(new_concept)
            new_notes.push(new_note)
            new_questions.push(new_question)
            new_answers.push(new_answer)

            new_concepts = _sort_by_sequence_val(new_concepts, 2)
            new_notes = _sort_by_sequence_val(new_notes, 3)
            new_questions = _sort_by_sequence_val(new_questions, 3)
            new_answers = _sort_by_sequence_val(new_answers, 4)

            setConcepts(new_concepts)
            setNotes(new_notes)
            setQuestions(new_questions)
            setAnswers(new_answers)
            console.log('concepts', new_concepts)
            console.log('notes', new_notes)
            console.log('questions', new_questions)
            console.log('answers', new_answers)
        }
    }

    function handleNoteKeyDown(event, note) {
        console.log('note key down')

        const note_concept_sequence = _find_concept_sequence(note['Sequence'])

        if (event.ctrlKey) {
            if (event.keyCode === 76) {
                // * LATEX
                console.log('latex')
                event.preventDefault()
                note['Latex'] = !note['Latex']
                note['Changed'] = true
            } else if (event.keyCode === 39) {
                console.log('shift right')
                event.preventDefault()
                var indent_int = parseInt(note['Indent Level']);
                indent_int++;
                var new_indent_str = Math.min(6, indent_int).toString();
                note['Indent Level'] = new_indent_str;
                note['Changed'] = true
            } else if (event.keyCode === 37) {
                console.log('shift left')
                event.preventDefault()
                var sl_indent_int = parseInt(note['Indent Level']);
                sl_indent_int--;
                var sl_new_indent_str = Math.max(0, sl_indent_int).toString();
                note['Indent Level'] = sl_new_indent_str;
                note['Changed'] = true
            }
            var new_notes = [];
            for (var i = 0; i < notes.length; i++) {
                const current_note = notes[i]
                if (current_note['Sequence'] === note['Sequence']) {
                    new_notes.push(note)
                } else {
                    new_notes.push(current_note)
                }
            }
            setNotes(new_notes)
        } else if (event.keyCode === 13) {
            console.log('new note')
            event.preventDefault()
            // * find notes inside and outside the current concept
            var concept_notes = [];
            var non_concept_notes = [];
            for (var j = 0; j < notes.length; j++) {
                const current_note = notes[j];
                const current_note_concept_sequence = _find_concept_sequence(current_note['Sequence'])
                if (current_note_concept_sequence === note_concept_sequence) {
                    concept_notes.push(current_note);
                } else {
                    non_concept_notes.push(current_note);
                }
            }
            // * loop through concept notes, updating the sequences
            var new_concept_notes = [];
            const note_sequence_val = _find_last_sequence_val(note['Sequence'])
            for (var k = 0; k < concept_notes.length; k++) {
                const concept_note = concept_notes[k];
                const concept_note_sequence_val = _find_last_sequence_val(concept_note['Sequence'])
                if (concept_note_sequence_val > note_sequence_val) {
                    concept_note['Sequence'] = note_concept_sequence + `.${concept_note_sequence_val + 1}`
                    concept_note['Changed'] = true
                }
                new_concept_notes.push(concept_note)
            }
            // * add new note to concept notes
            const new_note_sequence = note_concept_sequence + `.${note_sequence_val + 1}`
            const new_note = build_new_note(new_note_sequence);
            new_concept_notes.push(new_note);
            // * add the new list of concept notes and the non-concept notes, set notes to this list
            const all_new_notes = new_concept_notes.concat(non_concept_notes);
            console.log(all_new_notes)
            setNotes([])
            setNotes(all_new_notes)
        }
    }

    function _question_answer_enter(event, question_answer) {
        console.log('new qa')
        event.preventDefault()
        const question_concept_sequence = _find_concept_sequence(question_answer['Sequence'])

        // * find questions and answers inside and outside the current concept
        // ! questions
        var concept_questions = [];
        var non_concept_questions = [];
        for (var i = 0; i < questions.length; i++) {
            const current_question = questions[i];
            const current_question_concept_sequence = _find_concept_sequence(current_question['Sequence'])
            if (current_question_concept_sequence === question_concept_sequence) {
                concept_questions.push(current_question);
            } else {
                non_concept_questions.push(current_question);
            }
        }
        // ! answers
        var concept_answers = [];
        var non_concept_answers = [];
        for (var j = 0; j < answers.length; j++) {
            const current_answer = answers[j];
            const current_answer_concept_sequence = _find_concept_sequence(current_answer['Sequence'])
            if (current_answer_concept_sequence === question_concept_sequence) {
                concept_answers.push(current_answer);
            } else {
                non_concept_answers.push(current_answer);
            }
        }

        // * loop through concept q/a's, updating the sequences
        // ! questions
        var new_concept_questions = [];
        const question_sequence_val = _find_last_sequence_val(question_answer['Sequence'])
        for (var k = 0; k < concept_questions.length; k++) {
            const concept_question = concept_questions[k];
            const concept_question_sequence_val = _find_last_sequence_val(concept_question['Sequence'])
            if (concept_question_sequence_val > question_sequence_val) {
                concept_question['Sequence'] = question_concept_sequence + `.${concept_question_sequence_val + 1}`
                concept_question['Changed'] = true;
            }
            new_concept_questions.push(concept_question)
        }

        // ! answers
        var new_concept_answers = [];
        for (var l = 0; l < concept_answers.length; l++) {
            const concept_answer = concept_answers[l];
            const concept_answer_sequence_val = _find_last_sequence_val(concept_answer['Sequence'])
            if (concept_answer_sequence_val > question_sequence_val) {
                concept_answer['Sequence'] = question_concept_sequence + `.${concept_answer_sequence_val + 1}`
                concept_answer['Changed'] = true
            }
            new_concept_answers.push(concept_answer)
        }

        // * add new q/a to concept q/a's
        // ! question
        const new_question_sequence = question_concept_sequence + `.${question_sequence_val + 1}`
        const new_question = build_new_question(new_question_sequence);
        new_concept_questions.push(new_question);

        // ! answer
        const new_answer_sequence = question_concept_sequence + `.${question_sequence_val + 1}`
        const new_answer = build_new_answer(new_answer_sequence);
        new_concept_answers.push(new_answer);

        // * add the new list of concept q/a's and the non-concept q/a's, set q/a to this list
        // ! question
        const all_new_questions = new_concept_questions.concat(non_concept_questions)
        setQuestions([])
        setQuestions(all_new_questions)

        // ! answer
        const all_new_answers = new_concept_answers.concat(non_concept_answers)
        setAnswers([])
        setAnswers(all_new_answers)
    }

    function handleQuestionKeyDown(event, question) {
        console.log('question key down')

        if (event.keyCode === 13) {
            _question_answer_enter(event, question)
        }

        if (event.ctrlKey) {
            if (event.keyCode === 76) {
                // * LATEX
                event.preventDefault()
                question['Latex'] = !question['Latex']
                question['Changed'] = true
            } else if (event.keyCode === 39) {
                console.log('shift right')
                event.preventDefault()
                var indent_int = parseInt(question['Indent Level']);
                indent_int++;
                var new_indent_str = Math.min(6, indent_int).toString();
                question['Indent Level'] = new_indent_str
                question['Changed'] = true
            } else if (event.keyCode === 37) {
                console.log('shift left')
                event.preventDefault()
                var sl_indent_int = parseInt(question['Indent Level']);
                sl_indent_int--;
                var sl_new_indent_str = Math.max(0, sl_indent_int).toString();
                question['Indent Level'] = sl_new_indent_str
                question['Changed'] = true
            }
            var new_questions = [];
            for (var i = 0; i < questions.length; i++) {
                const current_question = questions[i]
                if (current_question['Sequence'] === question['Sequence']) {
                    new_questions.push(question)
                    console.log(question)
                } else {
                    new_questions.push(current_question)
                }
            }
            setQuestions([])
            setQuestions(new_questions)
        }
    }

    function handleAnswerKeyDown(event, answer) {
        console.log('answer key down')

        if (event.keyCode === 13) {
            // * just adding a new answer to below the current one
            var answer_sequence_val = _find_last_sequence_val(answer['Sequence'])
            var question_sequence = _find_question_sequence(answer['Sequence'])
            var new_answer_sequence = `${question_sequence}.${answer_sequence_val + 1}`
            var new_answer = build_new_answer(new_answer_sequence)
            answers.push(new_answer)
            setAnswers([])
            setAnswers(answers)
        } else if (event.keyCode === 8 && answer['Answer'].length === 0) {
            console.log('delete')
            const delete_id = answer['_id']['$oid']
            var new_answers = [];
            for (var i = 0; i < answers.length; i++) {
                const current_answer = answers[i]
                if (current_answer['_id']['$oid'] !== delete_id) {
                    new_answers.push(current_answer)
                } else {
                    console.log('mongodb func')
                    const url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Delete_Note";
                    const class_url_string = `?class=${props.classname}`
                    var url = url_base_string + class_url_string.replace(/ /g, '%20');
                    axios.put(url, answer).then((res) => {
                        console.log(res.data)
                    })
                }
            }
            setAnswers(new_answers)
        }
        if (event.ctrlKey) {
            if (event.keyCode === 76) {
                // * LATEX
                event.preventDefault()
                answer['Latex'] = !answer['Latex']
                answer['Changed'] = true
            } else if (event.keyCode === 39) {
                console.log('shift right')
                event.preventDefault()
                var indent_int = parseInt(answer['Indent Level']);
                indent_int++;
                var new_indent_str = Math.min(6, indent_int).toString();
                answer['Indent Level'] = new_indent_str
                answer['Changed'] = true
            } else if (event.keyCode === 37) {
                console.log('shift left')
                event.preventDefault()
                var sl_indent_int = parseInt(answer['Indent Level']);
                sl_indent_int--;
                var sl_new_indent_str = Math.max(0, sl_indent_int).toString();
                answer['Indent Level'] = sl_new_indent_str
                answer['Changed'] = true
            }
            var new_answers = [];
            for (var i = 0; i < answers.length; i++) {
                const current_answer = answers[i]
                if (current_answer['Sequence'] === answer['Sequence']) {
                    new_answers.push(answer)
                } else {
                    new_answers.push(current_answer)
                }
            }
            setAnswers(new_answers)
        }
    }

    function newFirstConcept(event) {
        // if 0 concepts, create concept, note, question, answer
        if (concepts.length === 0) {
            // find section/subsection index in props.classes
            var section_index = 0;
            var subsection_index = 0;
            for (var i = 0; i < props.classes.length; i++) {
                const current_class = props.classes[i]
                if (current_class['Name'] === props.classname) {
                    const sections = Object.keys(current_class['Sections_dict']);
                    for (var j = 0; j < sections.length; j++) {
                        const current_section = sections[j]
                        if (current_section === props.sectionname) {
                            section_index = j;
                            const subsections = current_class['Sections_dict'][current_section];
                            for (var k = 0; k < subsections.length; k++) {
                                const current_subsection = subsections[k]
                                if (current_subsection === props.subsectionname) {
                                    subsection_index = k;
                                }
                            }
                        }
                    }
                }
            }
            const concept_sequence = `${section_index + 1}.${subsection_index + 1}.1`
            const new_concept = build_new_concept(concept_sequence);
            const new_note = build_new_note(concept_sequence + '.1');
            const new_question = build_new_question(concept_sequence + '.1');
            const new_answer = build_new_answer(concept_sequence + '.1.1');
            setConcepts([new_concept]);
            setNotes([new_note]);
            setQuestions([new_question]);
            setAnswers([new_answer]);
        } else {
            console.log("Already have a concept")
        }
    }

    function uploadImage(event, document) {  // Top Level
        // * * * uploads an image to AWS S3
        const filename = `${props.classname}-${props.sectionname}-${props.subsectionname}-${document['_id']['$oid']}`;
        const config = {
            bucketName: 'popquiznotes',
            dirName: 'dkoch',
            region: 'us-east-2',
            accessKeyId: 'AKIAXJW6E2ZATCCXPVIL',
            secretAccessKey: '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',
        };
        const ReactS3Client = new S3(config);
        ReactS3Client.uploadFile(event.target.files[0], filename).then((res) => {
            if (document['type'] === "Note") {
                var new_notes = [];
                for (var i = 0; i < notes.length; i++) {
                    var current_note = notes[i];
                    if (current_note["_id"]["$oid"] === document["_id"]["$oid"]) {
                        current_note['Image'] = res['location'];
                        current_note['Changed'] = true;
                    }
                    new_notes.push(current_note);
                }
                setNotes(new_notes);
            } else if (document['type'] === 'Question') {
                var new_questions = [];
                for (var j = 0; j < questions.length; j++) {
                    var current_question = questions[j];
                    if (current_question["_id"]["$oid"] === document["_id"]["$oid"]) {
                        current_question['Image'] = res['location'];
                        current_question['Changed'] = true;
                    }
                    new_questions.push(current_question);
                }
                setQuestions(new_questions);
            } else if (document['type'] === 'Answer') {
                var new_answers = [];
                for (var k = 0; k < answers.length; k++) {
                    var current_answer = answers[k];
                    if (current_answer["_id"]["$oid"] === document["_id"]["$oid"]) {
                        current_answer['Image'] = res['location'];
                        current_answer['Changed'] = true;
                    }
                    new_answers.push(current_answer);
                }
                setAnswers(new_answers);
            }
        }).then((res) => {
            saveDocuments(null);
        })
    }

    function handleQuizClick(event, quizlevel) {
        console.log('quiz click')
        props.setShownotes(false);
        props.setQuizlevel(quizlevel)
    }

    return (
        <div className="notes">
            <h1>{props.classname} - {props.sectionname} - {props.subsectionname}</h1>
            <button onClick={(event) => saveDocuments(event)}>Save</button>
            <button onClick={(event) => newFirstConcept(event)}>New First Concept</button>
            <button onClick={(event) => handleQuizClick(event, 3)}>Quiz Everything</button>
            <button onClick={(event) => handleQuizClick(event, 2)}>Quiz Class</button>
            <button onClick={(event) => handleQuizClick(event, 1)}>Quiz Section</button>
            <button onClick={(event) => handleQuizClick(event, 0)}>Quiz Subsection</button>
            <br></br>
            <br></br>

            {_sort_by_sequence_val(concepts, 2).map((concept, index) => {
                return (
                    <div key={index}>
                        <Concept
                            key={index + 'c'}
                            concept={concept}
                            handleChange={handleConceptChange}
                            handleKeyDown={handleConceptKeyDown}
                        />
                        <NotesSection
                            key={index + 'n'}
                            concept={concept}
                            notes={notes}
                            handleChange={handleNoteChange}
                            handleKeyDown={handleNoteKeyDown}
                            uploadImage={uploadImage}
                        />
                        <QuestionAnswers
                            key={index + 'qa'}
                            concept={concept}
                            questions={questions}
                            answers={answers}
                            handleQuestionChange={handleQuestionChange}
                            handleAnswerChange={handleAnswerChange}
                            handleQuestionKeyDown={handleQuestionKeyDown}
                            handleAnswerKeyDown={handleAnswerKeyDown}
                            uploadImage={uploadImage}
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default Notes;
