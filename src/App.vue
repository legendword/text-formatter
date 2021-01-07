<template>
  <div id="app">
    <h2 class="app-title" style="text-align: left;">
      TextFormatter
      <span class="author-info">by <a href="https://legendword.com/">Legendword</a></span>
    </h2>
    <div class="app-workarea">
      <el-row :gutter="20">
        <el-col :span="14">
          <el-input ref="textarea" class="fullheight" type="textarea" :autosize="{ minRows: 10, maxRows: 50}" v-model="text" v-on:input="textareaChange"></el-input>
        </el-col>
        <el-col :span="10" class="fullheight">
          <el-collapse v-model="activeTool" @change='activeToolChange' accordion>
            <el-collapse-item name="3">
              <template slot="title">
                <h3>Quick Actions</h3>
              </template>
              <div>
                <el-form :label-position="topFormLabelPosition">
                  <el-form-item>
                    <el-button type="primary" round @click="addSpaces">Add Spaces</el-button>
                    <el-button type="primary" round @click="addBookSymbols">Add Book Symbols</el-button>
                    <el-button type="primary" round @click="randomCapitalize">Random Capitalize</el-button>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="warning" round @click="executeAllQuickActions">Execute All</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>
            <el-collapse-item name="1">
              <template slot="title">
                <h3>Format</h3>
              </template>
              <div>
                <el-form :label-position="topFormLabelPosition" :model="formatForm">
                  <el-form-item label="Current Format">
                    <el-radio-group v-model="formatForm.currentFormat">
                      <el-radio :label="0">None</el-radio>
                      <el-radio :label="1">Line Separated</el-radio>
                      <el-radio :label="2">Comma Separated</el-radio>
                      <el-radio :label="3">Semicolon Separated</el-radio>
                      <el-radio :label="4">Space Separated</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="New Format">
                    <el-radio-group v-model="formatForm.newFormat">
                      <el-radio :label="0">None</el-radio>
                      <el-radio :label="1">Line Separated</el-radio>
                      <el-radio :label="2">Comma Separated</el-radio>
                      <el-radio :label="3">Semicolon Separated</el-radio>
                      <el-radio :label="4">Space Separated</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" round @click="convertFormat">Convert</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>
            <el-collapse-item name="2">
              <template slot="title">
                <h3>Find and Replace</h3>
              </template>
              <div>
                <el-form :model="replaceForm">
                  <el-form-item label="Format:">
                    <el-radio-group v-model="replaceForm.findFormat">
                      <el-radio :label="0">Plain Text</el-radio>
                      <el-radio :label="1">Regular Expression</el-radio>
                      <el-radio :label="2">Legendword Expression*</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="Find:">
                    <el-input v-model="replaceForm.findStr"></el-input>
                  </el-form-item>
                  <el-form-item label="Replace Setting">
                    <el-radio-group v-model="replaceForm.replaceSetting">
                      <el-radio :label="0">Don't Replace</el-radio>
                      <el-radio :label="1">Replace Once</el-radio>
                      <el-radio :label="2">Replace All</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="Replace:">
                    <el-input v-model="replaceForm.replaceStr" :disabled="replaceForm.replaceSetting==0"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" round @click="findReplace">Execute</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>
            <el-collapse-item name="4">
              <template slot="title">
                <h3>Repeat</h3>
              </template>
              <div>
                <el-form :model="repeaterForm">
                  <el-form-item label="Repeat:">
                    <el-radio-group v-model="repeaterForm.repeatMode">
                      <el-radio :label="0">Everything</el-radio>
                      <el-radio :label="1">Each Row</el-radio>
                      <el-radio :label="2">Each Character</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="Separator:">
                    <el-radio-group v-model="repeaterForm.separator">
                      <el-radio :label="0">Newline</el-radio>
                      <el-radio :label="1">None</el-radio>
                      <el-radio :label="2">Spaces</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="Count:">
                    <el-input-number v-model="repeaterForm.repeatCount" :min="1" :max="1000"></el-input-number>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" round @click="startRepeater">Execute</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>
            <el-collapse-item name="5">
              <template slot="title">
                <h3>Capitalize</h3>
              </template>
              <div>
                <el-form :model="capitalizeForm">
                  <el-form-item label="Capitalize:">
                    <el-radio-group v-model="capitalizeForm.mode">
                      <el-radio :label="0">Everything</el-radio>
                      <el-radio :label="1">Start of Sentence</el-radio>
                      <el-radio :label="2">Start of Paragraph</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" round @click="startCapitalize">Execute</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
      
    </div>
  </div>
</template>

<script>
import LegendwordExpression from './LegendwordExpression';

const formatSeparators = [null, '\n', ',', ';', ' '];
const convertFormatSeparators = ['', '\n', ',', ';', ' '];
const repeaterSeparators = ['\n', '', ' '];
const capitalizeSeparators = [null, '.', '\n'];
export default {
  data() {
    return {
      text: '',
      activeTool: '',
      topFormLabelPosition: 'top',
      formatForm: {
        currentFormat: 0,
        newFormat: 0
      },
      replaceForm: {
        findFormat: 0,
        findStr: '',
        replaceSetting: 2,
        replaceStr: ''
      },
      repeaterForm: {
        repeatMode: 0,
        separator: 0,
        repeatCount: 3
      },
      capitalizeForm: {
        mode: 1
      }
    }
  },
  methods: {
    executeAllQuickActions() {
      this.randomCapitalize();
      this.addBookSymbols();
      this.addSpaces();
    },
    randomCapitalize() {
      this.text = this.text.toLowerCase().split('').map(v => Math.random()<0.5 ? v.toUpperCase() : v).join('');
      this.textareaChange();
      this.textareaFocus();
    },
    startCapitalize() {
      if (this.capitalizeForm.mode == 0) {
        this.text = this.text.toUpperCase()
      }
      else {
        let separator = capitalizeSeparators[this.capitalizeForm.mode];
        let sentences = this.text.split(separator);
        for (let i=0;i<sentences.length;i++) {
          let sentence = sentences[i];
          for (let j=0;j<sentence.length;j++) {
            if (sentence[j] != ' ' && sentence[j] != '\n') {
              sentences[i] = sentence.substring(0, j) + sentence[j].toUpperCase() + sentence.substring(j+1);
              break;
            }
          }
        }
        this.text = sentences.join(separator);
      }
      this.textareaChange();
      this.textareaFocus();
    },
    startRepeater() {
      let splitter = null;
      let content;
      if (this.repeaterForm.repeatMode == 1) splitter = '\n';
      else if (this.repeaterForm.repeatMode == 2) splitter = '';
      if (splitter !== null) content = this.text.split(splitter);
      else content = [this.text];
      let res = [];
      let sp = repeaterSeparators[this.repeaterForm.separator];
      for (let j=0;j<content.length;j++) {
        res.push(content[j]);
        for (let i=0;i<this.repeaterForm.repeatCount;i++) {
          res[j] += sp + content[j];
        }
      }
      this.text = res.join(splitter);
      this.textareaChange();
      this.textareaFocus();
    },
    addBookSymbols() {
      this.text = this.text.split("\n").map(v => '《'+v+'》').join("\n");
      this.textareaChange();
      this.textareaFocus();
    },
    addSpaces() {
      let lines = this.text.split("\n");
      for (let i=0;i<lines.length;i++) {
        lines[i] = lines[i].split("").join(" ");
      }
      this.text = lines.join("\n");
      this.textareaChange();
      this.textareaFocus();
    },
    recognizeFormat() {
      let flag = false;
      for (let i=0;i<formatSeparators.length;i++) {
        if (formatSeparators[i]==null) continue;
        if (this.text.includes(formatSeparators[i])) {
          this.formatForm.currentFormat = i;
          flag = true;
          break;
        }
      }
      if (flag==false) this.formatForm.currentFormat = 0;
    },
    convertFormat() {
      if (this.formatForm.currentFormat == 0 || this.formatForm.currentFormat == this.formatForm.newFormat) {
        return;
      }
      this.text = this.text.split(formatSeparators[this.formatForm.currentFormat]).join(convertFormatSeparators[this.formatForm.newFormat]);
      this.textareaChange();
      this.textareaFocus();
    },
    findReplace() {
      if (this.replaceForm.replaceSetting == 0) {
        alert('Find Only is not currently supported yet.');
        return;
      }
      switch (this.replaceForm.findFormat) {
        case 0:
          this.text = this.replaceForm.replaceSetting == 1 ? this.text.replace(this.replaceForm.findStr, this.replaceForm.replaceStr) : this.text.replaceAll(this.replaceForm.findStr, this.replaceForm.replaceStr);
          break;
        case 1:
          this.text = this.replaceForm.replaceSetting == 1 ? this.text.replace(this.parseRegExpStr(this.replaceForm.findStr), this.replaceForm.replaceStr) : this.text.replaceAll(this.parseRegExpStr(this.replaceForm.findStr), this.replaceForm.replaceStr);
          break;
        case 2:
          break;
        default:
          break;
      }
      this.textareaChange();
      this.textareaFocus();
    },
    parseRegExpStr(str) {
      let content = '';
      let flags = '';
      if (str[0]=='/' && str.lastIndexOf('/') > 0) {
        flags = str.substr(str.lastIndexOf('/')+1);
        content = str.substring(1,str.lastIndexOf('/'));
      }
      else content = str;
      return new RegExp(content, flags);
    },
    textareaChange() {
      this.recognizeFormat();
    },
    textareaFocus() {
      this.$refs.textarea.focus();
    },
    activeToolChange() {
      localStorage.setItem('LegendwordTextFormatterActiveTool', this.activeTool)
    }
    /*
    startHacking () {
      this.$notify({
        title: 'It works!',
        type: 'success',
        message: 'We\'ve laid the ground work for you. It\'s time for you to build something epic!',
        duration: 5000
      })
    }
    */
  },
  mounted() {
    this.$refs.textarea.focus();
    let saved = localStorage.getItem('LegendwordTextFormatterActiveTool');
    if (saved!==null) {
      this.activeTools = saved;
    }
    //LegendwordExpression test
    let expr = "(a?b) or (a?[345]) or (?<n>a) or (?<nc[.]><n>)";
    console.log("Expression:", expr);
    let obj = new LegendwordExpression(expr);
    console.log(obj.groups);
    console.log(obj.groups[0].query);
  }
}
</script>

<style>

#app {
  font-family: Helvetica, sans-serif;
  padding: 0 max( 20px, 5% );
}
.app-title {
  margin-top: 3rem;
}
.fullheight {
  height: calc( 100vh - 8rem );
  overflow: scroll;
}
.fullheight textarea {
  height: 100% !important;
}
.author-info {
  float: right;
  font-size: .8rem;
  font-weight: 400;
  color: gray;
  vertical-align: bottom;
}
.author-info > a, .author-info > a:active, .author-info > a:visited, .author-info > a:hover {
  color: gray;
}
</style>
