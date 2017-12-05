package pointerAnalysis;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.ibm.wala.cast.js.ipa.callgraph.JSCFABuilder;
import com.ibm.wala.cast.js.test.JSCallGraphBuilderUtil;
import com.ibm.wala.cast.js.translator.CAstRhinoTranslatorFactory;
import com.ibm.wala.ipa.callgraph.CallGraph;
import com.ibm.wala.ipa.callgraph.propagation.InstanceKey;
import com.ibm.wala.ipa.callgraph.propagation.PointerAnalysis;
import com.ibm.wala.ipa.callgraph.propagation.PointerAnalysisImpl;
import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;
import java.time.Duration;
import java.time.Instant;
public class PointerAnalysisTest {
	
	public static void main(String[] args) throws IllegalArgumentException, CancelException, IOException, WalaException{
		
		Map<String, Float> avgPointsTo = new HashMap<>();
		Map<String, Long> durations = new HashMap<>();
		Map<String, Long> pointerCounts = new HashMap<>();
		float avgRefsize =0.0f;
		File dir = new File(args[0]);
		File[] fileList = dir.listFiles();
		if (fileList != null) {
			for (File fileName : fileList) {
		    	if(fileName.getName().contains("ems"))
		    		continue;
		    	Instant start = Instant.now();  	
		    	com.ibm.wala.cast.js.ipa.callgraph.JSCallGraphUtil.setTranslatorFactory(new CAstRhinoTranslatorFactory());
				JSCFABuilder builder = JSCallGraphBuilderUtil.makeScriptCGBuilder(args[0], fileName.getName());
				CallGraph cg = builder.makeCallGraph(builder.getOptions());
	
				PointerAnalysis<InstanceKey> pa = builder.getPointerAnalysis();
				avgRefsize =PointsToSize.avgPtsSize(cg, (PointerAnalysisImpl) pa, fileName.getName());
		    	Instant end = Instant.now();
		    	Duration timeElapsed = Duration.between(start, end);
		    	
		    	pointerCounts.put(fileName.getName(), (long) PointsToSize.totalCount);
				avgPointsTo.put(fileName.getName(), avgRefsize);
				durations.put(fileName.getName(), timeElapsed.toMillis());
			}
		}
		for(String fileName: avgPointsTo.keySet()){
			System.out.println("Number of instruction Pointers for " +fileName +": " + pointerCounts.get(fileName) );
			System.out.println("Average pts-to for " +fileName +": " + avgPointsTo.get(fileName));
			System.out.println("Time elapsed for " +fileName +": " + durations.get(fileName) + " ms");
			System.out.println();
			
		}	
		
	}

}
