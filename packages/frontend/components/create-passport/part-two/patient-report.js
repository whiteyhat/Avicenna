import React from 'react'
import { Form, Input, Button, Table, Row, Col, Select } from 'antd'
const Option = Select.Option
const InputGroup = Input.Group

class PatientReport extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            patientReports: [],
            year: '',
            condition: '',
            additionalnotes: ''
        }
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    onSelectChange = (condition) => {
        this.setState({ condition })
    }

    patientReportsAdd(condition, year, additionalnotes) {
        this.setState({ patientReports: [...this.state.patientReports, { key: this.state.patientReports.length + 1, condition, year, additionalnotes }] })
    }

    render() {
        const columns = [
            {
                title: 'Condition',
                dataIndex: 'condition',
                key: 'condition',
            },
            {
                title: 'Year',
                dataIndex: 'year',
                key: 'year',
            },
            {
                title: 'Additional notes',
                dataIndex: 'additionalnotes',
                key: 'additionalnotes',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <span>
                        <a href="javascript:;">Delete</a>
                    </span>
                ),
            },
        ]
        const { patientReports, year, condition, additionalnotes } = this.state
        const { getFieldDecorator } = this.props.form
        return (
            <>
                <h1>Patient report</h1>
                <Table columns={columns} dataSource={patientReports} />
                <InputGroup>
                    <Row gutter={8}>
                        <Col span={4}>
                            <Select defaultValue="Active" style={{ width: '100%' }} name="condition" onChange={this.onSelectChange}>
                                <Option value="Active">Active</Option>
                                <Option value="Inactive">Inactive</Option>
                                <Option value="Recurrance">Recurrance</Option>
                                <Option value="Remission">Remission</Option>
                                <Option value="Resolved">Resolved</Option>
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Input type="date" name="year" onChange={this.onChange} />
                        </Col>
                        <Col span={10}>
                            <Input.TextArea name="additionalnotes" onChange={this.onChange} />
                        </Col>
                        <Col span={6}>
                            <Button type="primary" onClick={() => this.patientReportsAdd(condition, year, additionalnotes)}>Add</Button>
                        </Col>
                    </Row>
                </InputGroup>
                {patientReports && patientReports.map((patientReports, index) => (
                    <div key={index}>
                        <Form.Item>
                            {getFieldDecorator(`patientReports[${index}].condition`, { initialValue: patientReports.condition, rules: [] })
                                (
                                    <Input type="hidden" />
                                )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator(`patientReports[${index}].year`, { initialValue: patientReports.year, rules: [] })
                                (
                                    <Input type="hidden" />
                                )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator(`patientReports[${index}].additionalnotes`, { initialValue: patientReports.additionalnotes, rules: [] })
                                (
                                    <Input type="hidden" />
                                )}
                        </Form.Item>
                    </div>
                ))}
            </>
        )
    }
}

export default PatientReport
