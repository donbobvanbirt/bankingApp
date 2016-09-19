const App = React.createClass({
  getInitialState() {
    return {
      items: [],
      totalCredits: 0,
      totalDebits: 0,
      balance: 0
    }
  },

  addNewItem(newItem) {
    // console.log('state before addNewItem:', this.state);
    const { items } = this.state;
    items.push(newItem);
    this.setState({
      items: [...items]
    });
    this.sumBalance();
  },

  removeItem(id) {
    const { items } = this.state;
    let newItems = items.filter(item => item.id !== id);
    this.setState({
      items: newItems
    }, () => this.sumBalance());
  },

  edit(newState) {
    this.setState({
      items: newState
    })
    this.sumBalance();
  },

  sumBalance() {
    const { items } = this.state;
    let totalDebits = 0;
    let totalCredits = 0;
    let debits = [];
    let credits = [];
    let item;

    // round to two decimals
    function round(num) {
      return Math.round(num * 100) / 100;
    }

    for (let i=0; i<items.length; i++) {
      item = items[i];
      if(item.type === "debit") {
        totalDebits += parseFloat(item.amount);
      } else {
        totalCredits += parseFloat(item.amount);
      }
    }

    totalDebits = round(totalDebits);
    totalCredits = round(totalCredits);

    let totalBalance = totalCredits - totalDebits;

    totalBalance = round(totalBalance);

    this.setState({
      totalCredits: totalCredits,
      totalDebits: totalDebits,
      balance: totalBalance
    })
  },

  render() {

    const { items, balance, totalCredits, totalDebits } = this.state;
    return (
      <div className="container">
        <h1>Banking App</h1>
        <NewItemForm addNewItem={this.addNewItem} sumBalance={this.sumBalance}/>
        <ItemList items={items} balance={balance} totalCredits={totalCredits} totalDebits={totalDebits} removeItem={this.removeItem} editItem={this.editItem} editState={this.editState} edit={this.edit}/>
      </div>
    )
  },
})

// list
const ItemList = React.createClass({
  getInitialState() {
    return {
      editing: ""
    }
  },

  editItem (item) {
    this.setState({
      editing: item
    })
  },

  endEdit() {
    this.setState({
      editing: ""
    })
    //------------
  },

  onChange (name, index) {
    const { amount, description, credit, debit } = this.refs;
    let newItems = this.props.items;

    // if (!amount.value) {
    //   amount.value = 0;
    // }

    if (name === "amount") {
      newItems[index][name] = amount.value;
    } else if (name === "description"){
      newItems[index][name] = description.value;
    }

    if (credit.checked) {
      newItems[index]["type"] = "credit";
      // console.log('crdit:', credit.value);
    } else if (debit.checked) {
      newItems[index]["type"] = "debit";
      // console.log('debit', debit.value);
    }
    this.props.edit(newItems);
  },

  render() {
    const { items, balance, totalCredits, totalDebits, removeItem, editState } = this.props;

    let Items = items.map((item, index) => {

      // if editing
      if (item.id === this.state.editing) {
        return (
          <tr key={item.id}>
            <td>
              <input ref="amount" onChange={this.onChange.bind(this, "amount", index)} type="number" min='0.01' step='0.01' value={item.amount} required/>
            </td>
            <td>
              <label className="btn btn-sm">
                <input ref="credit" onChange={this.onChange.bind(this, "credit", index)} type="radio" name="type" required /> Credit
                </label>
                <label className="btn btn-sm">
                  <input ref="debit" onChange={this.onChange.bind(this, "debit", index)} type="radio" name="type" /> Debit
                  </label>
                </td>
                <td>
                  <input ref="description" onChange={this.onChange.bind(this, "description", index)} type="text" value={item.description} />
                </td>
                <td>{item.submitted}</td>
                <td>
                  <button onClick={() => {this.endEdit()}} className="btn btn-sm btn-success"><i className="fa fa-edit"></i></button>
                </td>
                <td>
                  <button onClick={removeItem.bind(null, item.id)}  className="btn btn-sm btn-danger"><i className="fa fa-trash"></i></button>
                </td>
              </tr>
            )
          } else {

            // if not editing
            return (
              <tr key={item.id}>
                <td>{item.amount}</td>
                <td>{item.type}</td>
                <td>{item.description}</td>
                <td>{item.submitted}</td>
                <td>
                  <button onClick={() => {this.editItem(item.id)}} className="btn btn-sm btn-success"><i className="fa fa-edit"></i></button>
                </td>
                <td>
                  <button onClick={removeItem.bind(null, item.id)}  className="btn btn-sm btn-danger"><i className="fa fa-trash"></i></button>
                </td>
              </tr>
            )
          }
        })

        return (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th><i className="fa fa-usd"></i> Available Balance</th>
                  <th><i className="fa fa-plus"></i> Total Credits</th>
                  <th><i className="fa fa-minus"></i> Total Debits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{balance}</td>
                  <td>{totalCredits}</td>
                  <td>{totalDebits}</td>
                </tr>
              </tbody>
            </table>

            <h3>Transactions:</h3>
            <table className="table">
              <thead>
                <tr>
                  <th><i className="fa fa-usd"></i> Amount</th>
                  <th><i className="fa fa-exchange"></i> Type</th>
                  <th><i className="fa fa-info"></i> Discription</th>
                  <th><i className="fa fa-clock-o"></i> Submitted</th>
                  <th><i className="fa fa-edit"></i> Edit</th>
                  <th><i className="fa fa-trash"></i> Delete</th>
                </tr>
              </thead>
              <tbody>
                {Items}
              </tbody>
            </table>
          </div>
        )
      }
    })

    // form
    const NewItemForm = React.createClass({
      submitForm(e) {
        e.preventDefault();
        let { amount } = this.refs;

        function creditOrDebit () {
          if (document.getElementById("credit").checked) {
            return "credit";
          } else {
            return "debit";
          }
        }

        let item = {
          amount: amount.value,
          description: description.value,
          type: creditOrDebit(),
          submitted: moment().format('MMM Do, h:mm a'),
          id: uuid()
        }

        this.props.addNewItem(item);

        amount.value = "";
        description.value = "";
        credit.checked = false;
        debit.checked = false;
      },

      render() {
        return (
          <form onSubmit={this.submitForm}>
            <div className="form-group">
              <label htmlFor="newItem" ><i className="fa fa-usd"></i> Amount</label>
              <input ref="amount" type="number" className="form-control" id="amount" min='0.01' step='0.01' required/>
            </div>
            <div className="form-group">
              <label htmlFor="description"><i className="fa fa-info"></i> Description</label>
              <input type="text" className="form-control" id="description"/>
            </div>
            <div className="form-group">
              <label className="btn btn-sm">
                <input type="radio" name="type" id="credit" value="credit" required/> Credit
                </label>
                <label className="btn btn-sn">
                  <input type="radio" name="type" id="debit" value="debit"/> Debit
                  </label>
                  <button className="btn btn-default">Submit</button>
                </div>
              </form>
            )
          }
        })

        ReactDOM.render(
          <App/>,
          document.getElementById('root')
        )
