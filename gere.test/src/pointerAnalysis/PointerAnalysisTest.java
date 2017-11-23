package pointerAnalysis;

import java.io.IOException;

import com.ibm.wala.cast.js.ipa.callgraph.JSCFABuilder;
import com.ibm.wala.cast.js.test.JSCallGraphBuilderUtil;
import com.ibm.wala.cast.js.translator.CAstRhinoTranslatorFactory;
import com.ibm.wala.ipa.callgraph.CallGraph;
import com.ibm.wala.ipa.callgraph.propagation.InstanceKey;
import com.ibm.wala.ipa.callgraph.propagation.PointerAnalysis;
import com.ibm.wala.ipa.callgraph.propagation.PointerAnalysisImpl;
import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;

public class PointerAnalysisTest {
	
	public static void main(String[] args) throws IllegalArgumentException, CancelException, IOException, WalaException{
		com.ibm.wala.cast.js.ipa.callgraph.JSCallGraphUtil.setTranslatorFactory(new CAstRhinoTranslatorFactory());

		JSCFABuilder builder = JSCallGraphBuilderUtil.makeScriptCGBuilder("Benchmarks", "adn-tryagain.js");

		CallGraph cg = builder.makeCallGraph(builder.getOptions());

		PointerAnalysis<InstanceKey> pa = builder.getPointerAnalysis();
		
		
		//WALAExp obj = new WALAExp();
		System.out.println("Number of functions: " + WALAExp.getNumOfFunc(cg));
		System.out.println("Average points-to size: " + WALAExp.avgPtsSize((PointerAnalysisImpl) pa));
		


	}

}
