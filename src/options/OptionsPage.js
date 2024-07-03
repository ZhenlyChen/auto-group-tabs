import React from "react";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import {
  Flex,
  Divider,
  Button,
  Select,
  Typography,
  Form,
  Input,
  Space,
  Card,
} from "antd";
import { DeleteOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import "./OptionsPage.css";

class OptionsPage extends React.Component {
  static propTypes = {
    intl: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.i18n = (key) => props.intl.formatMessage({ id: key });
    this.form = React.createRef();
    this.state = {
      isEditting: false,
      isCreateModalOpen: false,
      isModifyModalOpen: false,
    };
  }

  componentDidMount = () => {
    chrome.storage.sync.get(["configuration"], (data) => {
      this.form.current.setFieldsValue(data.configuration);
    });
  };

  editOrSaveButtomOnClick = () => {
    if (!this.state.isEditting) {
      // 让表单变成编辑态
      this.setState({ isEditting: true });
      return;
    }

    const configuration = this.form.current.getFieldsValue();
    console.log(configuration);
    // 检查表单，然后保存配置信息，设置编辑状态为false
    this.form.current
      .validateFields({ recursive: true })
      .then(() => {
        chrome.storage.sync.set({ configuration: configuration }, () => {
          this.setState({ isEditting: false });
        });
      })
      .catch(() => {});
  };

  render() {
    return (
      <div className="configPage">
        <Flex
          gap="small"
          vertical
          style={{ marginTop: "50px", marginLeft: "10px", marginRight: "10px" }}
        >
          <Flex align="flex-end" justify="space-between">
            <Typography.Title style={{ margin: 0 }}>
              {this.i18n("config_page_title")}
            </Typography.Title>
            <Button
              type={this.state.isEditting ? "default" : "primary"}
              style={
                this.state.isEditting
                  ? {
                      background: "#76EE00",
                      borderColor: "#76EE00",
                      color: "#ffffff",
                    }
                  : null
              }
              onClick={this.editOrSaveButtomOnClick}
            >
              {this.state.isEditting ? this.i18n("save") : this.i18n("edit")}
            </Button>
          </Flex>
          <Divider style={{ marginBottom: 0 }} />
          <Form
            name="userConfiguration"
            ref={this.form}
            disabled={!this.state.isEditting}
            autoComplete="false"
          >
            <Typography.Title level={5}>
              {this.i18n("config_title_fallback")}
            </Typography.Title>
            <Form.Item name="fallback" initialValue="none">
              <Select
                style={{ width: "100%" }}
                onChange={() => {}}
                options={[
                  { value: "none", label: this.i18n("option_none") },
                  { value: "domain", label: this.i18n("option_domain") },
                  { value: "sld", label: this.i18n("option_sld") },
                ]}
              />
            </Form.Item>
            <Typography.Title level={5}>
              {this.i18n("config_title_custom_rule")}
            </Typography.Title>
            <Form.List name="rules">
              {(rules, { add, remove, move }) => (
                <Space
                  direction="vertical"
                  size="small"
                  style={{ display: "flex" }}
                >
                  {rules.map((rule, i) => (
                    <Card
                      size="small"
                      key={rule.key}
                      hoverable
                      style={{ border: "1px solid #B5B5B5" }}
                      extra={
                        <>
                          {rules.length > 1 && i > 0 && <UpOutlined style={{ marginRight: "8px" }} onClick={() => {
                            if (this.state.isEditting) {
                              move(i, i - 1);
                            }
                          }} />}
                          {i < rules.length - 1 && <DownOutlined style={{ marginRight: "8px" }} onClick={() => {
                            if (this.state.isEditting) {
                              move(i, i + 1);
                            }
                          }} />}
                          <DeleteOutlined onClick={() => {
                            if (this.state.isEditting) {
                              remove(rule.name);
                            }
                          }} />
                        </>
                      }
                    >
                      <Form.Item
                        labelCol={{
                          span: 6,
                        }}
                        wrapperCol={{
                          span: 18,
                        }}
                        labelAlign="left"
                        label={this.i18n("group_name")}
                        name={[rule.name, "name"]}
                        rules={[
                          {
                            required: true,
                            message: this.i18n("group_name_validate_message"),
                          },
                        ]}
                      >
                        <Input placeholder="Google" />
                      </Form.Item>
                      <Form.Item
                        label={this.i18n("patterns")}
                        labelCol={{
                          span: 6,
                        }}
                        wrapperCol={{
                          span: 18,
                        }}
                        labelAlign="left"
                        required
                        tooltip={{
                          title: this.i18n("tooltip_of_pattern"),
                          color: "blue",
                        }}
                      >
                        <Form.List
                          name={[rule.name, "patterns"]}
                          initialValue={[{ pattern: undefined }]}
                        >
                          {(patterns, patternOp) => (
                            <Space
                              direction="vertical"
                              size="small"
                              style={{ display: "flex" }}
                            >
                              {patterns.map((pattern) => (
                                <div
                                  key={pattern.key}
                                  style={{ display: "flex" }}
                                >
                                  <Form.Item
                                    noStyle
                                    name={[pattern.name, "pattern"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: this.i18n(
                                          "pattern_validate_message"
                                        ),
                                      },
                                    ]}
                                  >
                                    <Input placeholder="*.google.com" />
                                  </Form.Item>
                                  {patterns.length > 1 ? (
                                    <DeleteOutlined
                                      style={{ margin: "8px" }}
                                      onClick={() => {
                                        if (this.state.isEditting) {
                                          patternOp.remove(pattern.name);
                                        }
                                      }}
                                    />
                                  ) : null}
                                </div>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => patternOp.add()}
                                block
                              >
                                + {this.i18n("add_pattern")}
                              </Button>
                            </Space>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>
                  ))}

                  <Button type="dashed" onClick={() => add()} block>
                    + {this.i18n("add_rule")}
                  </Button>
                </Space>
              )}
            </Form.List>
          </Form>
        </Flex>
      </div>
    );
  }
}

export default injectIntl(OptionsPage);
