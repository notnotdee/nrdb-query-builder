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
  state = {
    userInputQueryStr: "",
    submittedQueryStr: "",
    accountId: 1,
  };

  handleUserSubmit = () => {
    const { userInputQueryStr } = this.state;
    this.setState({
      submittedQueryStr: userInputQueryStr,
      userInputQueryStr: "",
    });
  };

  render() {
    const { accountId, submittedQueryStr } = this.state;

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
      query: submittedQueryStr,
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
          <Button onClick={this.handleUserSubmit}>Submit</Button>
        </Form>
        {submittedQueryStr && (
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
