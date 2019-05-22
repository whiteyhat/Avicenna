import React from 'react'
import { Form, Icon, Input, Upload, Radio, Button } from 'antd';
import { Table, Divider, Tag } from 'antd';

class PartTwo extends React.Component {

    constructor(props) {
        super(props)
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
        const data = []
        const { getFieldDecorator } = this.props.form;
        return (
            <>
                <Table columns={columns} dataSource={data} />
            </>
        )
    }
}

export default PartTwo
