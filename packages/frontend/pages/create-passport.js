import React from 'react'
import Layout from '../components/layout'
import { Form, Steps, Button } from 'antd'
import PartOne from '../components/create-passport/part-one'
import PartTwo from '../components/create-passport/part-two/part-two'
import 'antd/dist/antd.css'

const Step = Steps.Step



class CreatePassport extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            current: 0
        }
    }

    next() {
        const current = this.state.current + 1
        this.setState({ current })
    }

    prev() {
        const current = this.state.current - 1
        this.setState({ current })
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
            }
        })
    }

    render() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        }
        const { current } = this.state
        const steps = [
            {
                title: 'Patient details',
            },
            {
                title: 'Patient report',
            },
            {
                title: 'Medications',
            },
            {
                title: 'Create passport',
            }
        ]
        return (
            <Layout>
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <Steps current={current}>
                        {steps.map(item => (
                            <Step key={item.title} title={item.title} />
                        ))}
                    </Steps>
                    <div className="steps-content" style={{ marginTop: '30px'}}>
                        <div style={{display: current == 0 ? '' : 'none'}}><PartOne form={this.props.form} /></div>
                        <div style={{display: current == 1 ? '' : 'none'}}><PartTwo form={this.props.form} /></div>
                        <span style={{display: current == 2 ? '' : 'none'}}>Part two</span>
                        <span style={{display: current == 3 ? '' : 'none'}}>Part two</span>
                    </div>
                    <div className="steps-action">
                        {current < steps.length - 1 && (
                            <Button type="primary" onClick={() => this.next()}>
                                Next
                            </Button>
                        )}
                        {current === steps.length - 1 && (
                            <Button type="primary" htmlType="submit">
                                Done
                            </Button>
                        )}
                        {current > 0 && (
                            <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                                Previous
                            </Button>
                        )}
                    </div>
                </Form>
            </Layout>
        )
    }

    componentDidMount() {
        // To disabled submit button at the beginning.
        this.props.form.validateFields()
    }

}
const CreatePassportForm = Form.create({ name: 'create-passport' })(CreatePassport)
export default CreatePassportForm
