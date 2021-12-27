/*
 *  ==============================================================================
 *  File: quiz.js
 *  Project: client
 *  File Created: Monday, 20th December 2021 1:31:09 pm
 *  Author: Dillon Koch
 *  -----
 *  Last Modified: Monday, 20th December 2021 1:31:11 pm
 *  Modified By: Dillon Koch
 *  -----
 * 
 *  -----
 *  Putting the quiz in Popquiznotes
 *  ==============================================================================
 */

import axios from 'axios';
import 'katex/dist/katex.min.css';
import React, { useEffect, useState } from 'react';
import { InlineMath } from 'react-katex';


function _find_last_sequence_val(sequence) {
    // * finding the integer of the last value in the sequence
    const sequence_vals = sequence.split('.')
    return parseInt(sequence_vals.slice(-1)[0]);
}

function _find_question_sequence(sequence) {
    // * returning the sequence of just the question, not other values after the fourth
    const sequence_vals = sequence.split('.').slice(0, 4);
    const question_sequence = sequence_vals.join('.')
    return question_sequence
}

function _find_concept_sequence(sequence) {
    // * returning the sequence of just the concept, not other values after the third
    const sequence_vals = sequence.split('.').slice(0, 3);
    const concept_sequence = sequence_vals.join('.')
    return concept_sequence
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

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function Katex(props) {
    return (
        <div className="katexanswer">
            <InlineMath math={String(props.text)} />
        </div>
    )
}

function Answer(props) {

    return (
        <div className="quizanswer">
            {props.answers.map((answer, index) => {
                return (
                    <div key={index}>
                        {answer['Latex'] === true ? <Katex text={answer['Answer']} /> : <p>{answer['Answer']}</p>}
                        {answer['Image'] === "" ? null : <img src={answer['Image']} alt="" />}
                    </div>
                )
            })}
        </div>
    )
}

function QuizQuestion(props) {
    const [questionanswers, setQuestionanswers] = useState([]);
    const [questionconcept, setQuestionconcept] = useState([]);
    const [showanswer, setShowanswer] = useState(false);

    useEffect(() => {
        // * finding answers to the current question
        var new_question_answers = [];
        for (var i = 0; i < props.answers.length; i++) {
            const current_answer = props.answers[i];
            const current_answer_question_sequence = _find_question_sequence(current_answer['Sequence'])
            if (current_answer_question_sequence === props.question['Sequence']) {
                new_question_answers.push(current_answer)
            }
        }
        setQuestionanswers(new_question_answers);
        // * finding the concept for the current question
        var new_question_concept = [];
        const current_question_concept_sequence = _find_concept_sequence(props.question['Sequence']);
        for (var j = 0; j < props.concepts.length; j++) {
            const current_concept = props.concepts[j];
            if (current_concept['Sequence'] === current_question_concept_sequence) {
                new_question_concept = current_concept;
                break;
            }
        }
        setQuestionconcept(new_question_concept);
    }, [props.answers, props.concepts, props.question]);

    function handleCorrectClick(event) {
        console.log('correct answer clicked')
        props.incrementQuestionIndex();
        // TODO send to mdb table
    }

    function handleIncorrectClick(event) {
        console.log('incorrect answer clicked')
        props.incrementQuestionIndex();
        // TODO send to mdb table
    }

    function handleSkipClick(event) {
        console.log('skip answer clicked')
        props.incrementQuestionIndex();
        // TODO send to mdb table
    }

    return (
        <div>
            <h2>{questionconcept['Concept Name']} ({props.question['Section']}, {props.question['Subsection']})</h2>
            <h1>{props.question['Question']}</h1>
            {props.question['Image'] === "" ? null : <img src={props.question['Image']} alt="" />}
            {showanswer ? <Answer answers={questionanswers} /> : <button onClick={(event) => setShowanswer(true)}>Show Answer</button>}

            {showanswer ? <div>
                <button onClick={(event) => handleCorrectClick(event)}>Correct</button>
                <button onClick={(event) => handleIncorrectClick(event)}>Incorrect</button>
                <button onClick={(event) => handleSkipClick(event)}>Skip</button></div> : null}
        </div>
    )
}



function Quiz(props) {
    const [quiztype, setQuiztype] = useState("");
    const [concepts, setConcepts] = useState([]);
    const [notes, setNotes] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [subquestions, setSubquestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [questionindex, setQuestionindex] = useState(1);

    useEffect(() => {
        // * building url
        var url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Quiz";
        var url_param_string = `?quizcontent=${props.quizcontent}&class=${props.classname}&section=${props.sectionname}&subsection=${props.subsectionname}&quiztype=${quiztype}`
        var url = url_base_string + url_param_string.replace(/ /g, '%20');
        console.log('url', url)
        // * loading questions and answers, set questions
        if (quiztype !== "") {
            axios.get(url).then((res) => {
                console.log('res data', res.data.length, res.data)
                // * assigning documents to each type (NOT assigning quiz subquestions yet)
                var quiz_concepts = []
                var quiz_notes = []
                var quiz_questions = []
                var quiz_subquestions = []
                var quiz_answers = []
                for (var i = 0; i < res.data.length; i++) {
                    const current_document = res.data[i];
                    if (res.data[i]['type'] === "Concept") {
                        quiz_concepts.push(current_document)
                    } else if (res.data[i]['type'] === "Note") {
                        quiz_notes.push(current_document)
                    } else if (res.data[i]['type'] === 'Question') {
                        if (current_document['Indent Level'] === '1') {
                            quiz_questions.push(current_document)
                        } else {
                            quiz_subquestions.push(current_document)
                        }
                    } else if (res.data[i]['type'] === 'Answer') {
                        quiz_answers.push(current_document)
                    }
                }

                // * building a new list of questions, where the top level questions are randomized, then subquestions follow in order
                var new_question_lists = [];
                for (var j = 0; j < quiz_questions.length - 1; j++) {
                    const current_question = quiz_questions[j]
                    const next_question = quiz_questions[j + 1]
                    const current_question_val = _find_last_sequence_val(current_question['Sequence'])
                    const next_question_val = _find_last_sequence_val(next_question['Sequence'])

                    var new_question_list = [current_question]
                    for (var k = 0; k < quiz_subquestions.length; k++) {
                        const current_subquestion = quiz_subquestions[k]
                        const current_subquestion_val = _find_last_sequence_val(current_subquestion['Sequence'])
                        if (current_subquestion_val > current_question_val && current_subquestion_val < next_question_val) {
                            new_question_list.push(current_subquestion)
                        }
                    }
                    new_question_lists.push(new_question_list)
                }
                // * running the same thing on the last question, where we won't check if the val is less than the next one (there isn't a next one)
                const last_question_list = [quiz_questions[quiz_questions.length - 1]]
                const last_question_val = _find_last_sequence_val(quiz_questions[quiz_questions.length - 1]['Sequence'])
                for (var l = 0; l < quiz_subquestions.length; l++) {
                    const current_subquestion = quiz_subquestions[l]
                    const current_subquestion_val = _find_last_sequence_val(current_subquestion['Sequence'])
                    if (current_subquestion_val > last_question_val) {
                        last_question_list.push(current_subquestion)
                    }
                }
                new_question_lists.push(last_question_list)
                new_question_lists = shuffle(new_question_lists)

                // * building final questions, a shuffled version of new_question_lists, where top level questions are shuffled, and subquestions are in order
                var final_questions = []
                for (var m = 0; m < new_question_lists.length; m++) {
                    final_questions = final_questions.concat(new_question_lists[m])
                }

                setConcepts(quiz_concepts)
                setNotes(quiz_notes)
                setQuestions(final_questions)
                console.log(final_questions)
                setAnswers(quiz_answers)

            })
        }

    }, [quiztype, props.quizcontent, props.classname, props.sectionname, props.subsectionname])

    function handleBacktoNotesClick(event) {
        props.setShownotes(true);
    }

    function incrementQuestionIndex() {
        setQuestionindex(questionindex + 1);
        console.log(questionindex)
    }

    return (
        <div className="quiz">
            <button onClick={(event) => handleBacktoNotesClick(event)}>Back to Notes</button>
            <h1>Quiz</h1>
            <button onClick={(event) => setQuiztype("Random")}>Random</button>
            <button onClick={(event) => setQuiztype("Recently Missed")}>Recently Missed</button>
            <button>Been a While</button>
            <button>Never Asked</button>
            <button>On Repeat</button>
            <button>Easy</button>
            <button>Medium</button>
            <button>Hard</button>

            {questions.length === 0 ? <p>choose quiz type</p> : questions.slice(0, questionindex).map((question, index) => {
                return (
                    <QuizQuestion
                        key={index}
                        concepts={concepts}
                        question={question}
                        subquestions={subquestions}
                        notes={notes}
                        answers={answers}
                        incrementQuestionIndex={incrementQuestionIndex}
                    />
                )
            })}

        </div>
    )
}

export default Quiz;
