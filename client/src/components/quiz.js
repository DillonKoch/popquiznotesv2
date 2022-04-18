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


function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

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
        // * send to mdb table
        var info = {
            "Class": props.classname, "Section": props.question['Section'],
            'Subsection': props.question['Subsection'], 'Correct': true,
            "Question Sequence": props.question['Sequence']
        }
        axios.post(`https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Upload_Response?class=${props.classname}`, info).then((res) => {
            console.log('RES DATA', res.data)
        })
    }

    function handleIncorrectClick(event) {
        console.log('incorrect answer clicked')
        props.incrementQuestionIndex();
        // * send to mdb table
        var info = {
            "Class": props.classname, "Section": props.question['Section'],
            'Subsection': props.question['Subsection'], 'Correct': false,
            "Question Sequence": props.question['Sequence']
        }
        axios.post(`https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Upload_Response?class=${props.classname}`, info).then((res) => {
            console.log('RES DATA', res.data)
        })
    }

    function handleSkipClick(event) {
        console.log('skip answer clicked')
        props.incrementQuestionIndex();
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
    const [answers, setAnswers] = useState([]);
    const [questionindex, setQuestionindex] = useState(1);

    // useEffect(() => {
    //     // * building url
    //     var url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Quiz";
    //     var url_param_string = `?quizcontent=${props.quizcontent}&class=${props.classname}&section=${props.sectionname}&subsection=${props.subsectionname}&quiztype=${quiztype}`
    //     var url = url_base_string + url_param_string.replace(/ /g, '%20');
    //     console.log('url', url)
    //     // * loading questions and answers, set questions
    //     if (quiztype !== "") {
    //         axios.get(url).then((res) => {
    //             console.log('res data', res.data.length, res.data)
    //             // * assigning documents to each type (NOT assigning quiz subquestions yet)
    //             var quiz_concepts = []
    //             var quiz_notes = []
    //             var quiz_questions = []
    //             var quiz_subquestions = []
    //             var quiz_answers = []
    //             for (var i = 0; i < res.data.length; i++) {
    //                 const current_document = res.data[i];
    //                 if (res.data[i]['type'] === "Concept") {
    //                     quiz_concepts.push(current_document)
    //                 } else if (res.data[i]['type'] === "Note") {
    //                     quiz_notes.push(current_document)
    //                 } else if (res.data[i]['type'] === 'Question') {
    //                     if (current_document['Indent Level'] === '1') {
    //                         quiz_questions.push(current_document)
    //                     } else {
    //                         quiz_subquestions.push(current_document)
    //                     }
    //                 } else if (res.data[i]['type'] === 'Answer') {
    //                     quiz_answers.push(current_document)
    //                 }
    //             }

    //             // * building a new list of questions, where the top level questions are randomized, then subquestions follow in order
    //             var new_question_lists = [];
    //             for (var j = 0; j < quiz_questions.length - 1; j++) {
    //                 const current_question = quiz_questions[j]
    //                 const next_question = quiz_questions[j + 1]
    //                 const current_question_val = _find_last_sequence_val(current_question['Sequence'])
    //                 const next_question_val = _find_last_sequence_val(next_question['Sequence'])

    //                 var new_question_list = [current_question]
    //                 for (var k = 0; k < quiz_subquestions.length; k++) {
    //                     const current_subquestion = quiz_subquestions[k]
    //                     const current_subquestion_val = _find_last_sequence_val(current_subquestion['Sequence'])
    //                     if (current_subquestion_val > current_question_val && current_subquestion_val < next_question_val) {
    //                         new_question_list.push(current_subquestion)
    //                     }
    //                 }
    //                 new_question_lists.push(new_question_list)
    //             }
    //             // * running the same thing on the last question, where we won't check if the val is less than the next one (there isn't a next one)
    //             const last_question_list = [quiz_questions[quiz_questions.length - 1]]
    //             const last_question_val = _find_last_sequence_val(quiz_questions[quiz_questions.length - 1]['Sequence'])
    //             for (var l = 0; l < quiz_subquestions.length; l++) {
    //                 const current_subquestion = quiz_subquestions[l]
    //                 const current_subquestion_val = _find_last_sequence_val(current_subquestion['Sequence'])
    //                 if (current_subquestion_val > last_question_val) {
    //                     last_question_list.push(current_subquestion)
    //                 }
    //             }
    //             new_question_lists.push(last_question_list)
    //             new_question_lists = shuffle(new_question_lists)

    //             if (quiztype === 'Random') {
    //                 // * building final questions, a shuffled version of new_question_lists, where top level questions are shuffled, and subquestions are in order
    //                 var final_questions = []
    //                 for (var m = 0; m < new_question_lists.length; m++) {
    //                     final_questions = final_questions.concat(new_question_lists[m])
    //                 }
    //             } else {
    //                 // * loading quiz responses from that table
    //                 var url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Quiz_Responses";
    //                 const info = { "quizcontent": props.quizcontent, "Class": props.classname, "Section": props.sectionname, "Subsection": props.subsectionname }
    //                 console.log('url', url_base_string)
    //                 axios.post(url_base_string, info).then((res) => {
    //                     console.log("RESPONSE RES", res.data)

    //                     // * now filtering down based on the quiz responses
    //                     if (quiztype === "Recently Missed") {
    //                         console.log('miss')
    //                         // * go through quiz responses, make list of questions missed recently
    //                         var missed_question_sequences = [];
    //                         for (var n = 0; n < res.data.length; n++) {
    //                             const current_response = res.data[n]
    //                             console.log(res.data[n]['Timestamp'])
    //                             const current_date = Date.parse(res.data[n]['Timestamp'])
    //                             const current_date_minus_3_days = new Date() - (3 * 24 * 60 * 60 * 1000)

    //                             // * adding if the question was missed, in the last 3 days, and if it wasn't already added 
    //                             if (current_response['Correct'] === false) {
    //                                 if (current_date > current_date_minus_3_days) {
    //                                     if (missed_question_sequences.includes(current_response['Sequence']) === false) {
    //                                         missed_question_sequences.push(current_response['Question Sequence'])
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                         console.log('missed_question_sequences', missed_question_sequences)

    //                         // * making the final_questions list of questions that have a  missed question sequence
    //                         var final_questions = []
    //                         for (var o = 0; o < new_question_lists.length; o++) {
    //                             var has_miss = false;
    //                             const current_question_list = new_question_lists[o]
    //                             for (var p = 0; p < current_question_list.length; p++) {
    //                                 const current_question = current_question_list[p]
    //                                 if (missed_question_sequences.includes(current_question['Sequence'])) {
    //                                     has_miss = true;
    //                                 }
    //                             }
    //                             if (has_miss) {
    //                                 final_questions.concat(current_question_list)
    //                             }
    //                         }
    //                         console.log("FINAL QWUESTIONS", final_questions)


    //                     } else if (quiztype === "Been a While") {
    //                         console.log('while')
    //                     } else if (quiztype === "Never Asked") {
    //                         console.log('never')
    //                     } else if (quiztype === "On Repeat") {
    //                         console.log('repeat')
    //                     } else if (quiztype === "Hard") {
    //                         console.log('hard')
    //                     } else if (quiztype === "Medium") {
    //                         console.log('medium')
    //                     } else if (quiztype === "Easy") {
    //                         console.log('easy')
    //                     }
    //                     return final_questions;
    //                 })

    //                 // ! REMOVE LATER
    //                 var final_questions = []
    //                 for (var m = 0; m < new_question_lists.length; m++) {
    //                     final_questions = final_questions.concat(new_question_lists[m])
    //                 }
    //             }


    //             setConcepts(quiz_concepts)
    //             setNotes(quiz_notes)
    //             setQuestions(final_questions)
    //             console.log(final_questions)
    //             setAnswers(quiz_answers)
    //         })
    //     }

    // }, [quiztype, props.quizcontent, props.classname, props.sectionname, props.subsectionname])

    useEffect(() => {

        // ! Load all documents with /Query_Quiz

        var url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Quiz";
        var url_param_string = `?quizcontent=${props.quizcontent}&class=${props.classname}&section=${props.sectionname}&subsection=${props.subsectionname}&quiztype=${quiztype}`
        var url = url_base_string + url_param_string.replace(/ /g, '%20');
        console.log('url', url)
        if (quiztype !== "") {
            axios.get(url).then((res) => {
                console.log('res data', res.data.length, res.data)

                // ! Organize documents into questions, subquestions, concepts, notes, answers

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
                setConcepts(quiz_concepts)
                setNotes(quiz_notes)
                setAnswers(quiz_answers)

                // ! make lists of questions with first item a top level question, then subquestions, if any

                var new_question_lists = [];
                for (var j = 0; j < quiz_questions.length; j++) {
                    // * current question, starting question_list
                    const current_question = quiz_questions[j];
                    var current_question_list = [current_question]
                    var current_question_concept_sequence = _find_concept_sequence(current_question['Sequence'])

                    // * finding other questions' sequence vals in same concept
                    var other_questions_sequence_vals = [];
                    for (var k = 0; k < quiz_questions.length; k++) {
                        const other_question = quiz_questions[k];
                        const other_question_concept_sequence = _find_concept_sequence(other_question['Sequence'])
                        if (j !== k && current_question_concept_sequence === other_question_concept_sequence) {
                            const other_question_sequence_val = _find_last_sequence_val(other_question['Sequence'])
                            other_questions_sequence_vals.push(other_question_sequence_val)
                        }
                    }

                    // * locating the lowest sequence val of a top level question after the current one, if any
                    const current_question_sequence_val = _find_last_sequence_val(current_question['Sequence'])
                    var next_question_sequence_val = 100000;
                    for (var l = 0; l < other_questions_sequence_vals.length; l++) {
                        const current_oq_sequence_val = other_questions_sequence_vals[l];
                        if (current_oq_sequence_val > current_question_sequence_val && current_oq_sequence_val < next_question_sequence_val) {
                            next_question_sequence_val = current_oq_sequence_val;
                        }
                    }

                    // * adding subquestions from the concept with seuqence greater than current question, less than next question
                    for (var m = 0; m < quiz_subquestions.length; m++) {
                        const current_subquestion = quiz_subquestions[m];
                        const current_subquestion_concept_sequence = _find_concept_sequence(current_subquestion['Sequence'])
                        const current_subquestion_sequence_val = _find_last_sequence_val(current_subquestion['Sequence'])
                        if (current_subquestion_concept_sequence === current_question_concept_sequence) {
                            if (current_subquestion_sequence_val > current_question_sequence_val) {
                                if (current_subquestion_sequence_val < next_question_sequence_val) {
                                    current_question_list.push(current_subquestion)
                                }
                            }
                        }
                    }
                    new_question_lists.push(current_question_list)
                    new_question_lists = shuffle(new_question_lists)
                }

                // ! load the quiz responses from mongodb

                var url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Quiz_Responses";
                const info = { "quizcontent": props.quizcontent, "Class": props.classname, "Section": props.sectionname, "Subsection": props.subsectionname }
                console.log('url', url_base_string)
                axios.post(url_base_string, info).then((res) => {
                    console.log("RESPONSE RES", res.data)
                    // * making a list of miss sequences
                    var miss_sequences = [];  // TODO make this recent misses
                    for (var a = 0; a < res.data.length; a++) {
                        const current_response = res.data[a];
                        if (current_response['Correct'] === false) {
                            miss_sequences.push(current_response['Sequence'])
                        }
                    }

                    // ! use the quiz type to filter out questions that don't fit the criteria

                    if (quiztype === "Random") {
                        console.log('random')
                        var final_questions = []
                        for (var n = 0; n < new_question_lists.length; n++) {
                            final_questions = final_questions.concat(new_question_lists[n])
                            console.log(final_questions.length)
                        }
                        setQuestions(final_questions)
                        console.log(final_questions.length, final_questions)

                    } else if (quiztype === "Recently Missed") { // TODO not done
                        var final_questions = [];

                        // * looping through the question lists
                        for (var o = 0; o < new_question_lists.length; o++) {
                            const current_question_list = new_question_lists[o];
                            var has_miss = false;
                            // * looping through questions in questions_list, if any are missed, add them to final_questions


                        }


                        // TODO all that's left is writing code to do all this filtering
                    } else if (quiztype === "Been a While") {
                        console.log('while')
                    } else if (quiztype === "Never Asked") {
                        console.log('never')
                    } else if (quiztype === "On Repeat") {
                        console.log('repeat')
                    } else if (quiztype === "Hard") {
                        console.log('hard')
                    } else if (quiztype === "Medium") {
                        console.log('medium')
                    } else if (quiztype === "Easy") {
                        console.log('easy')
                    }
                })
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
                        notes={notes}
                        answers={answers}
                        incrementQuestionIndex={incrementQuestionIndex}
                        classname={props.classname}
                    />
                )
            })}

        </div>
    )
}

export default Quiz;
