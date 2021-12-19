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
import "../App.css";

function Concept(props) {
    const [concept, setConcept] = useState(props.concept)

    function handleChange(event) {
        let newValue = event.target.value;
        setConcept(prevState => {
            let newConcept = { ...prevState, Changed: true };
            newConcept['Concept Name'] = newValue;
            props.handleChange(newConcept);
            return newConcept;
        });
    }

    return (
        <div>
            <TextareaAutosize
                type="text"
                value={concept['Concept Name']}
                className="concept"
                rows="1"
                onChange={(event) => handleChange(event)}
            />
        </div>
    )
}


function Note(props) {
    const [note, setNote] = useState(props.note);

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
        console.log('note key down')
    }

    return (
        <div>
            <TextareaAutosize
                type="text"
                value={note['Note']}
                className="note"
                rows="1"
                onChange={(event) => handleChange(event)}
                onKeyDown={(event) => handleNoteKeyDown(event)}
            />
        </div>
    )
}


function NotesSection(props) {
    const [conceptnotes, setConceptnotes] = useState([]);

    useEffect(() => {
        var new_concept_notes = [];
        for (var i = 0; i < props.notes.length; i++) {
            const sequence = props.notes[i]['Sequence'];
            const sequence_vals = sequence.split('.').slice(0, 3);
            const concept_sequence = sequence_vals.join('.')
            if (concept_sequence === props.concept['Sequence']) {
                new_concept_notes.push(props.notes[i]);
            }
        }
        setConceptnotes(new_concept_notes);
    }, [props.notes, props.concept])

    return (
        <div>
            {conceptnotes.map((conceptnote, index) => {
                return (
                    <div key={index}>
                        <Note
                            note={conceptnote}
                            handleChange={props.handleChange}
                        />
                    </div>
                )
            })}
        </div>
    )
}

function Question(props) {
    const [question, setQuestion] = useState(props.question);

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
        // TODO not done
        console.log('question key down')
    }

    return (
        <div>
            <TextareaAutosize
                type="text"
                value={question['Question']}
                className="question"
                rows="1"
                onChange={(event) => handleChange(event)}
                onKeyDown={(event) => handleKeyDown(event)}
            />
        </div>
    )
}

function Answer(props) {
    const [answer, setAnswer] = useState(props.answer);

    function handleChange(event) {
        let newValue = event.target.value;
        setAnswer(prevState => {
            let newAnswer = { ...prevState, Changed: true };
            newAnswer['Answer'] = newValue;
            props.handleChange(newAnswer);
            return newAnswer;
        })
    }

    return (
        <div>
            <TextareaAutosize
                type="text"
                value={answer['Answer']}
                className="answer"
                rows="1"
                onChange={(event) => handleChange(event)}
            // onKeyDown={(event) => handleKeyDown(event)}
            />
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
            const sequence = props.answers[i]['Sequence'];
            const sequence_vals = sequence.split('.').slice(0, 4);
            const question_sequence = sequence_vals.join('.')
            if (question_sequence === props.question['Sequence']) {
                new_question_answers.push(props.answers[i]);
            }
        }
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
            const question_sequence = question['Sequence'];
            const question_sequence_vals = question_sequence.split('.').slice(0, 3);
            const question_concept_sequence = question_sequence_vals.join('.')
            if (question_concept_sequence === props.concept['Sequence']) {
                current_concept_questions.push(question);
            }
        }
        setConceptquestions(current_concept_questions);

        // ! ANSWERS
        console.log(props.answers.length)
        // filter down to current concept (gets filtered down to certain question next in answerssection)
        var current_concept_answers = [];
        for (var j = 0; j < props.answers.length; j++) {
            const answer = props.answers[j];
            const answer_sequence = answer['Sequence'];
            const answer_sequence_vals = answer_sequence.split('.').slice(0, 3);
            const answer_concept_sequence = answer_sequence_vals.join('.')
            if (answer_concept_sequence === props.concept['Sequence']) {
                current_concept_answers.push(answer);
            }
        }
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
                        />
                        <AnswerSection
                            key={index + 'a'}
                            question={question}
                            answers={conceptanswers}
                            handleChange={props.handleAnswerChange}
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

    function newFirstConcept(event) {
        console.log('new first concept')
    }

    return (
        <div className="notes">
            <h1>{props.classname} - {props.sectionname} - {props.subsectionname}</h1>
            <button onClick={(event) => saveDocuments(event)}>Save</button>
            <button onClick={(event) => newFirstConcept(event)}>New First Concept</button>
            <br></br>
            <br></br>

            {concepts.map((concept, index) => {
                return (
                    <div key={index}>
                        <Concept
                            key={index + 'c'}
                            concept={concept}
                            handleChange={handleConceptChange}
                        />
                        <NotesSection
                            key={index + 'n'}
                            concept={concept}
                            notes={notes}
                            handleChange={handleNoteChange}
                        />
                        <QuestionAnswers
                            key={index + 'qa'}
                            concept={concept}
                            questions={questions}
                            answers={answers}
                            handleQuestionChange={handleQuestionChange}
                            handleAnswerChange={handleAnswerChange}
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default Notes;
