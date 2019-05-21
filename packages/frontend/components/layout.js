import React from 'react'
import Link from 'next/link';
import Head from 'next/head'
import { Layout, Menu, Breadcrumb } from 'antd';


class CustomLayout extends React.Component {

  constructor(props){
    super(props)
  }

  render() {
    const { Header, Content, Footer } = Layout;
    return (
      <React.Fragment>
        <Head>
          <title>Lightning Hackaton 2019</title>
        </Head>

        <Layout className="layout">
          <Header>
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              style={{ lineHeight: '64px', textAlign: 'right' }}
            >
              <Menu.Item key="1"><Link href="/"><a>Home</a></Link></Menu.Item>
              <Menu.Item key="2"><Link href="/create-passport"><a>Create passport</a></Link></Menu.Item>
              <Menu.Item key="3"><Link href="/"><a>Logout</a></Link></Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
              <main>
                <div className='container'>{this.props.children}</div>
              </main>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Lightning Hackaton 2019</Footer>
        </Layout>


      </React.Fragment>
    )
  }
}

export default CustomLayout
