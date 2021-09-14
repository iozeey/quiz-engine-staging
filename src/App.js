import React, { useCallback, useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import WrittingQuiz from "./pages/quiz/WrittingQuiz";
import { Inspection } from "./components/Inspection/Inspection";
import { FillInBlanks } from "./components/fill_in_blanks/fill_in_blanks";
import QuizSubmit from "./components/true_false_questions/QuizSubmit";
import QuizRunner from "./pages/quiz/QuizRunner";
import quizAPI from "./libs/api/quiz";
import { baseUrl } from "./libs/env";
import { isLocalHosted } from "./libs/env";
import { useHistory } from "react-router-dom";

const App = (props) => {
  let  RoutePath=`/:id/:token`;
  const [items, setItems] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const getQuizId = () => window.location.pathname.split("/")[1];
  let history = useHistory();
  if (isLocalHosted === false) {
  Inspection();
  }

  useEffect(() => {
    quizAPI
      .get({ id: getQuizId() })
      .then((res) => res.json())
      .then((json) => {
        setIsLoaded(true);
        setItems(json);
      })
      .catch((error) => console.log(error.message));
  }, []);

  const submitQuiz = useCallback(
    (data) => {
      if (data.is_submit) {
        quizAPI
          .post({ id: getQuizId(), data })
          .then((res) => res.json())
          .then((json) => {
            setIsLoaded(true);
            setItems(json);
            if (json.is_show_feedback === false) {
              history.push("/stagging");
            }
          });
      } else {
        quizAPI.post({ id: getQuizId(), data });
      }
    },
    [history]
  );
  if (window.location.pathname.split("/").length === 4){
      RoutePath=`/:id/:token/:id`;
  }

  return (
    <Switch>
      <Route exact path={RoutePath}>
        {items.task_type === "Writing Task" ? (
          <WrittingQuiz
            data={items}
            isLoaded={isLoaded}
            onSubmit={submitQuiz}
          />
        ) : (
          <QuizRunner data={items} isLoaded={isLoaded} onSubmit={submitQuiz} />
        )}
      </Route>
      <Route exact path={`/quizsubmit`}>
        <QuizSubmit data={items} isLoaded={isLoaded} />
      </Route>
      <Route path={"/validations"}>
        <FillInBlanks />
      </Route>
      <Route path={"/quizreview"}>
        {items.task_type === "Writing Task" ? (
          <WrittingQuiz
            isReview={true}
            data={items}
            isLoaded={isLoaded}
            onSubmit={submitQuiz}
          />
        ) : (
          <QuizRunner
            isReview={true}
            data={items}
            isLoaded={isLoaded}
            onSubmit={submitQuiz}
          />
        )}
      </Route>
      <Route path={"/stagging"} render={() => (window.location = baseUrl)} />
      <Route exact path={`*`}>
        404 - Not fount
      </Route>
    </Switch>
  );
};

export default App;
