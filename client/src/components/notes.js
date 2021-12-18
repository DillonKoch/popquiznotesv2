/*
 *  ==============================================================================
 *  File: notes.js
 *  Project: client
 *  File Created: Sunday, 12th December 2021 9:44:35 pm
 *  Author: Dillon Koch
 *  -----
 *  Last Modified: Sunday, 12th December 2021 9:44:36 pm
 *  Modified By: Dillon Koch
 *  -----
 * 
 *  -----
 *  Notes Component
 *  ==============================================================================
 */


import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "../App.css"
import TextareaAutosize from 'react-textarea-autosize';
var crypto = require('crypto');


function Concept(props) {
    const [concept, setConcept] = useState(props.concept)

    function handleChange(event) {
        let newValue = event.target.value;
        setConcept(prevState => {
            let newConcept = { ...prevState, Changed: true };
            newConcept['Concept Name'] = newValue;
            props.handleChange(newConcept, props.concept_sequence);
            return newConcept;
        })

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
    const [note, setNote] = useState(props.note)

    function handleChange(event) {
        let newValue = event.target.value;
        setNote(prevState => {
            let newNote = { ...prevState, Changed: true };
            newNote['Note'] = newValue;
            props.handleChange(newNote, props.note_sequence);
            return newNote;
        })
    }

    return (
        <div>
            <TextareaAutosize
                type="text"
                value={note['Note']}
                className="note"
                rows="1"
                onChange={(event) => handleChange(event)}
            />
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
            props.handleChange(newQuestion, props.question_sequence);
            return newQuestion;
        })
    }

    return (
        <div>
            <TextareaAutosize
                type="text"
                value={question['Question']}
                className="question"
                rows="1"
                onChange={(event) => handleChange(event)}
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
            props.handleChange(newAnswer, props.answer_sequence);
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
            />
        </div>
    )
}

function Questionanswers(props) {

    return (
        <div>
            {props.questions.map((val, index) => {
                return (
                    <div key={index}>
                        <Question
                            text={val['Question']}
                            question={val}
                            question_sequence={val['Sequence']}
                            handleChange={props.handleQuestionChange}
                        />
                        <Answer
                            text={props.answers[index]['Answer']}
                            answer={props.answers[index]}
                            answer_sequence={props.answers[index]['Sequence']}
                            handleChange={props.handleAnswerChange}
                        />
                    </div>
                )
            })}
        </div>
    )
}

function Notes(props) {
    const [data, setData] = useState([]);
    const [keys, setKeys] = useState([]);

    useEffect(() => {
        // * building URL
        var url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Notes";
        var url_param_string = `?class=${props.classname}&section=${props.sectionname}&subsection=${props.subsectionname}`;
        var url = url_base_string + url_param_string.replace(/ /g, '%20');
        console.log(url)

        // * grabbing data
        axios.get(url).then((res) => {
            console.log('raw data:')
            console.log(res.data);

            // * creating cleaned_data to store concept sequence: obj (obj containing concept, note, question, answer)
            var cleaned_data = [];
            for (var i = 0; i < res.data.length; i++) {
                const document = res.data[i];
                console.log(document)
                if (document['type'] === 'Concept') {
                    const sub_obj = { 'concept': document, 'Notes': [], 'Questions': [], 'Answers': [] }
                    cleaned_data[document['Sequence']] = sub_obj
                }
            }
            console.log('data with concepts added:')
            console.log(cleaned_data);

            // * ---------
            // * going through the documents a second time to add the notes, questions, and answers
            for (var j = 0; j < res.data.length; j++) {
                const document = res.data[j];
                const document_type = document['type'];
                if (document_type !== 'Concept') {
                    const sequence = document['Sequence'];
                    const sequence_vals = sequence.split('.').slice(0, 3);
                    const concept_sequence = sequence_vals.join('.')
                    cleaned_data[concept_sequence][document_type + 's'].push(document)
                }
            }
            console.log('fully cleaned data:', cleaned_data)
            setKeys(Object.keys(cleaned_data))
            setData([]); // stupid solution to rerender but it works
            setData(cleaned_data);
        })
    }, [props.subsectionname])

    function handleConceptChange(newConcept, sequence) {
        data[sequence]['concept'] = newConcept;
    }

    function handleNoteChange(newNote, sequence) {
        const sequence_vals = sequence.split('.').slice(0, 3);
        const concept_sequence = sequence_vals.join('.');
        console.log('note change')
        var new_note_id = newNote['_id']['$oid'];
        var changed_note_index = data[concept_sequence]['Notes'].findIndex((note => note['_id']['$oid'] === new_note_id));
        data[concept_sequence]['Notes'][changed_note_index] = newNote;
    }

    function handleQuestionChange(newQuestion, sequence) {
        const sequence_vals = sequence.split('.').slice(0, 3);
        const concept_sequence = sequence_vals.join('.');
        console.log('question change')
        var new_question_id = newQuestion['_id']['$oid'];
        var changed_question_index = data[concept_sequence]['Questions'].findIndex((question => question['_id']['$oid'] === new_question_id));
        data[concept_sequence]['Questions'][changed_question_index] = newQuestion;
    }

    function handleAnswerChange(newAnswer, sequence) {
        const sequence_vals = sequence.split('.').slice(0, 3);
        const concept_sequence = sequence_vals.join('.');
        console.log('answer change')
        var new_answer_id = newAnswer['_id']['$oid'];
        var changed_answer_index = data[concept_sequence]['Answers'].findIndex((answer => answer['_id']['$oid'] === new_answer_id));
        data[concept_sequence]['Answers'][changed_answer_index] = newAnswer;
    }

    function saveDocuments() {
        // extract out all the documents, loop through them and update the changed ones
        var all_documents = [];
        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            const concept = data[key]['concept'];
            const notes = data[key]['Notes'];
            const questions = data[key]['Questions'];
            const answers = data[key]['Answers'];
            all_documents.push(concept)
            all_documents = all_documents.concat(notes, questions, answers)
        }
        // go through all documents, and save the changed ones to mongodb
        for (var i = 0; i < all_documents.length; i++) {
            const document = all_documents[i];
            if (document['Changed']) {
                console.log('changed document:')
                console.log(document)
                axios.post(`https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Update_Document?class=${props.classname}`, document).then((res) => {
                    console.log('body', res.data)
                })
            }
        }
    }

    function newFirstConcept() {
        console.log('new first concept')
        console.log(keys.length)

        for (var i = 0; i < props.classes.length; i++) {
            if (props.classes[i]['Name'] === props.classname) {
                var class_index = i;
                break;
            }
        }
        const sections = Object.keys(props.classes[class_index]['Sections_dict']);
        for (var i = 0; i < sections.length; i++) {
            if (sections[i] === props.sectionname) {
                var section_index = i + 1;
                break;
            }
        }
        const subsections = props.classes[class_index]['Sections_dict'][props.sectionname]
        for (var i = 0; i < subsections.length; i++) {
            if (subsections[i] === props.subsectionname) {
                var subsection_index = i + 1;
                break;
            }
        }

        var new_sequence = `${section_index}.${subsection_index}.1`;

        const new_concept = {
            "_id": { "$oid": crypto.randomBytes(12).toString('hex') },
            "Section": props.sectionname, "Subsection": props.subsectionname,
            "type": "Concept", "Sequence": new_sequence, "Changed": true, "Concept Name": ""
        };
        const new_note = {
            "_id": { "$oid": crypto.randomBytes(12).toString('hex') },
            "Section": props.sectionname, "Subsection": props.subsectionname,
            "type": "Note", "Sequence": new_sequence + ".1", "Changed": true, "Note": "",
            "Image": "", "Latex": false, "Indent Level": 1
        };
        const new_question = {
            "_id": { "$oid": crypto.randomBytes(12).toString('hex') },
            "Section": props.sectionname, "Subsection": props.subsectionname,
            "type": "Question", "Sequence": new_sequence + ".1", "Changed": true, "Question": "",
        };
        const new_answer = {
            "_id": { "$oid": crypto.randomBytes(12).toString('hex') },
            "Section": props.sectionname, "Subsection": props.subsectionname,
            "type": "Answer", "Sequence": new_sequence + ".1.1", "Changed": true, "Answer": "",
            "Image": "", "Latex": false, "Indent Level": 1
        };
        const new_concept_obj = {
            "concept": new_concept,
            "Notes": [new_note],
            "Questions": [new_question],
            "Answers": [new_answer]
        }
        data[new_sequence] = new_concept_obj;
        setKeys([new_sequence]);
        console.log(data)
        console.log(keys)
    }

    return (
        <div className="notes">
            <div className="notescontainer">
                <h1>{props.classname} - {props.sectionname} - {props.subsectionname}</h1>
                <button onClick={(event) => saveDocuments(event)}>Save</button>
                <button onClick={(event) => newFirstConcept(event)}>New First Concept</button>
                <br></br>
                <br></br>
                {/* <p>{keys[0]}</p> */}
                {/* <p>{data[keys[0]]['concept']['Concept Name']}</p> */}

                {Object.keys(data).map((val, index1) => {
                    return (
                        <div key={index1}>
                            <Concept
                                concept={data[val]['concept']}
                                text={data[val]['concept']['Concept Name']}
                                // key={data[val]['concept']['_id']['$oid']}
                                id={data[val]['concept']['_id']['$oid']}
                                concept_sequence={val}
                                handleChange={handleConceptChange} />

                            {/* // * NOTES SECTION */}
                            {data[val]['Notes'].map((val, index2) => {
                                return (
                                    <Note
                                        note={val}
                                        text={val['Note']}
                                        key={index2}
                                        note_sequence={val['Sequence']}
                                        handleChange={handleNoteChange}
                                    />
                                )
                            })}

                            <Questionanswers
                                questions={data[val]['Questions']}
                                answers={data[val]['Answers']}
                                key={index1 + 'qa'}
                                handleQuestionChange={handleQuestionChange}
                                handleAnswerChange={handleAnswerChange}
                            />
                        </div>

                    )
                })}

            </div>
        </div>
    )
}

export default Notes;

// function Notesection(props) {

//     return (
//         <div>
//             {props.notes.map((val, index) => {
//                 return (
//                     <Note text={val['Note']} key={index} />
//                 )

//             })}
//         </div>
//     )
// }
