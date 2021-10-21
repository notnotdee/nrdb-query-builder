import React from "react";
import {
  ngql,
  NerdGraphQuery,
  Spinner,
  Form,
  MultilineTextField,
  Button,
} from "nr1";

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class NrdbQueryBuilderNerdlet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInputQueryStr: "",
      testQueryStr: "",
      accountId: 1,
    };
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput() {
    const { userInputQueryStr } = this.state;
    this.setState({
      testQueryStr: userInputQueryStr,
      userInputQueryStr: "",
    });
  }

  render() {
    const { accountId, userInputQueryStr, testQueryStr } = this.state;
    // console.log("testInput: ", testQueryStr, "userInput: ", userInputQueryStr);

    // to construct a query suggestion tool, will we have access to an API containing all possible query fields?
    const query = ngql`query($id: Int!, $query: Nrql!) {
          actor {
            account(id: $id) {
              nrql(query: $query) {
                nrql
                staticChartUrl
              }
            }
          }
        }`;

    const variables = {
      id: accountId,
      query: testQueryStr,
    };

    return (
      <>
        <Form>
          <MultilineTextField
            label="NRDB Query Builder"
            placeholder="Your query here..."
            onChange={({ target }) =>
              this.setState({ userInputQueryStr: target.value })
            }
          />
          <Button onClick={this.handleUserInput}>Submit</Button>
        </Form>
        {/* NerdGraphQuery must wait for a valid user-entered query (conditional rendering) in order to work properly */}
        {testQueryStr && (
          <NerdGraphQuery query={query} variables={variables}>
            {({ loading, error, data }) => {
              if (loading) {
                return <Spinner />;
              }

              if (error) {
                console.log(error);
                return "Error!";
              }

              return (
                <>
                  <span>
                    Querying: <br />
                    {data.actor.account.nrql.nrql}
                  </span>
                  <img src={data.actor.account.nrql.staticChartUrl} />;
                </>
              );
            }}
          </NerdGraphQuery>
        )}
      </>
    );
  }
}
